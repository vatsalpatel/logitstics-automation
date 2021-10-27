import math

import requests
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp


def calc_dist(lat1, lon1, lat2, lon2):
    # approximate radius of earth in km
    R = 6373.0

    lat1 = math.radians(float(lat1))
    lon1 = math.radians(float(lon1))
    lat2 = math.radians(float(lat2))
    lon2 = math.radians(float(lon2))

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c

    return distance


def create_matrix_geo(points, dataset):
    matrix = []
    for i in dataset:
        result = []
        for j in dataset:
            lt1, ln1 = i.split(",")
            lt2, ln2 = j.split(",")
            result.append(calc_dist(lt1, ln1, lt2, ln2))
        matrix.append(result)
    return matrix


def create_matrix(req_data, points):
    matrix = []
    formatted_points = []
    for p in points:
        lat, lng = tuple(map(str.strip, p.split(",")))
        formatted_points.append(f"{lng},{lat}")
    formatted_points = ";".join(formatted_points)
    q = f"http://router.project-osrm.org/table/v1/driving/{formatted_points}?annotations=distance"
    try:
        res = requests.get(q, timeout=10)
        if res.status_code == 200:
            matrix = res.json().get("distances")
        else:
            print("fallback to geo")
            matrix = create_matrix_geo(req_data, points)
    except Exception as e:
        print("fallback to geo due to exc", e)
        matrix = create_matrix_geo(req_data, points)
    return matrix


def create_data_model(req_data, points):
    data = {}
    data["distance_matrix"] = create_matrix(req_data, points)
    data["demands"] = [0, *[1 for i in range(len(req_data.get("points")))]]
    data["vehicle_capacities"] = req_data.get("capacity")
    data["num_vehicles"] = len(req_data.get("capacity"))
    data["depot"] = 0
    return data


def print_solution(data, manager, routing, solution, points, loop):
    routes = {}
    for vehicle_id in range(data["num_vehicles"]):
        index = routing.Start(vehicle_id)
        routes[vehicle_id] = []
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            routes[vehicle_id].append(points[node_index])
            index = solution.Value(routing.NextVar(index))
        if loop:
            routes[vehicle_id].append(points[0])
    return routes


def find_path(dataset):
    if dataset.get("start_point"):
        points = [dataset.get("start_point"), *dataset.get("points")]
    else:
        points = [*dataset.get("points")]
    data = create_data_model(dataset, points)
    options = {
        "AUTOMATIC": routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC,
        "PATH_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
        "PATH_MOST_CONSTRAINED_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
        "EVALUATOR_STRATEGY": routing_enums_pb2.FirstSolutionStrategy.EVALUATOR_STRATEGY,
        "SAVINGS": routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
        "SWEEP": routing_enums_pb2.FirstSolutionStrategy.SWEEP,
        "CHRISTOFIDES": routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES,
        "ALL_UNPERFORMED": routing_enums_pb2.FirstSolutionStrategy.ALL_UNPERFORMED,
        "BEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.BEST_INSERTION,
        "PARALLEL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
        "LOCAL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION,
        "GLOBAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC,
        "LOCAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC,
        "FIRST_UNBOUND_MIN_VALUE": routing_enums_pb2.FirstSolutionStrategy.FIRST_UNBOUND_MIN_VALUE,
    }
    search_options = {
        "AUTOMATIC": routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC,
        "GREEDY_DESCENT": routing_enums_pb2.LocalSearchMetaheuristic.GREEDY_DESCENT,
        "GUIDED_LOCAL_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH,
        "SIMULATED_ANNEALING": routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING,
        "TABU_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.TABU_SEARCH,
    }

    selected_strategy = routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
    if dataset.get("Strategy"):
        selected_strategy = options.get(dataset.get("Strategy"), routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC)

    selected_search_option = search_options.get(dataset.get("search_option"), routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC)

    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["num_vehicles"], data["depot"]
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        """Returns the demand of the node."""
        from_node = manager.IndexToNode(from_index)
        return data["demands"][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data["vehicle_capacities"],  # vehicle maximum capacities
        True,  # start cumul to zero
        "Capacity",
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = selected_strategy
    search_parameters.local_search_metaheuristic = selected_search_option
    search_parameters.time_limit.seconds = 40

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        loop = False
        if dataset.get("loop") is True:
            loop = True
        return print_solution(data, manager, routing, solution, points, loop)

    return {"data": "No Solution Found"}


def create_data_model_end(req_data, points):
    data = {}
    data["distance_matrix"] = create_matrix(req_data, points)
    data["demands"] = [
        0,
        *[1 for i in range(len(req_data.get("points")))],
        *[1 for i in range(len(req_data.get("end_points")))],
    ]
    data["vehicle_capacities"] = req_data.get("capacity")
    data["num_vehicles"] = len(req_data.get("capacity"))
    data["depot"] = 0
    data["starts"] = [0 for i in range(data["num_vehicles"])]
    data["ends"] = [
        i
        for i in range(
            len(req_data.get("points")) + 1,
            len(req_data.get("points")) + len(req_data.get("end_points")) + 1,
        )
    ]
    return data


def print_solution_end(data, manager, routing, solution, points):
    routes = {}
    for vehicle_id in range(data["num_vehicles"]):
        index = routing.Start(vehicle_id)
        routes[vehicle_id] = []
        route_distance = 0
        while not routing.IsEnd(index):
            routes[vehicle_id].append(points[manager.IndexToNode(index)])
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id
            )
        routes[vehicle_id].append(points[manager.IndexToNode(index)])
    return routes


def find_path_end(dataset):
    points = [
        dataset.get("start_point"),
        *dataset.get("points"),
        *dataset.get("end_points"),
    ]
    data = create_data_model_end(dataset, points)
    options = {
        "AUTOMATIC": routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC,
        "PATH_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
        "PATH_MOST_CONSTRAINED_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
        "EVALUATOR_STRATEGY": routing_enums_pb2.FirstSolutionStrategy.EVALUATOR_STRATEGY,
        "SAVINGS": routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
        "SWEEP": routing_enums_pb2.FirstSolutionStrategy.SWEEP,
        "CHRISTOFIDES": routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES,
        "ALL_UNPERFORMED": routing_enums_pb2.FirstSolutionStrategy.ALL_UNPERFORMED,
        "BEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.BEST_INSERTION,
        "PARALLEL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
        "LOCAL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION,
        "GLOBAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC,
        "LOCAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC,
        "FIRST_UNBOUND_MIN_VALUE": routing_enums_pb2.FirstSolutionStrategy.FIRST_UNBOUND_MIN_VALUE,
    }
    options = {
        "AUTOMATIC": routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC,
        "PATH_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC,
        "PATH_MOST_CONSTRAINED_ARC": routing_enums_pb2.FirstSolutionStrategy.PATH_MOST_CONSTRAINED_ARC,
        "EVALUATOR_STRATEGY": routing_enums_pb2.FirstSolutionStrategy.EVALUATOR_STRATEGY,
        "SAVINGS": routing_enums_pb2.FirstSolutionStrategy.SAVINGS,
        "SWEEP": routing_enums_pb2.FirstSolutionStrategy.SWEEP,
        "CHRISTOFIDES": routing_enums_pb2.FirstSolutionStrategy.CHRISTOFIDES,
        "ALL_UNPERFORMED": routing_enums_pb2.FirstSolutionStrategy.ALL_UNPERFORMED,
        "BEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.BEST_INSERTION,
        "PARALLEL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION,
        "LOCAL_CHEAPEST_INSERTION": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_INSERTION,
        "GLOBAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC,
        "LOCAL_CHEAPEST_ARC": routing_enums_pb2.FirstSolutionStrategy.LOCAL_CHEAPEST_ARC,
        "FIRST_UNBOUND_MIN_VALUE": routing_enums_pb2.FirstSolutionStrategy.FIRST_UNBOUND_MIN_VALUE,
    }
    search_options = {
        "AUTOMATIC": routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC,
        "GREEDY_DESCENT": routing_enums_pb2.LocalSearchMetaheuristic.GREEDY_DESCENT,
        "GUIDED_LOCAL_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH,
        "SIMULATED_ANNEALING": routing_enums_pb2.LocalSearchMetaheuristic.SIMULATED_ANNEALING,
        "TABU_SEARCH": routing_enums_pb2.LocalSearchMetaheuristic.TABU_SEARCH,
    }

    selected_strategy = routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
    if dataset.get("Strategy"):
        selected_strategy = options.get(dataset.get("Strategy"), routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC)

    selected_search_option = search_options.get(dataset.get("search_option"), routing_enums_pb2.LocalSearchMetaheuristic.AUTOMATIC)

    manager = pywrapcp.RoutingIndexManager(
        len(data["distance_matrix"]), data["num_vehicles"], data["starts"], data["ends"]
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data["distance_matrix"][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        """Returns the demand of the node."""
        from_node = manager.IndexToNode(from_index)
        return data["demands"][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data["vehicle_capacities"],  # vehicle maximum capacities
        True,  # start cumul to zero
        "Capacity",
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = selected_strategy
    search_parameters.local_search_metaheuristic = selected_search_option
    search_parameters.time_limit.seconds = 40

    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        return print_solution_end(data, manager, routing, solution, points)

    return {"data": "No Solution Found"}
