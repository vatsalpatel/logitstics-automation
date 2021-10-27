import React from 'react'
import { Table, Container, TableBody, TableCell, TableHead, TableRow, Typography, Grid, Divider } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    card: {
        height: "10px",
        width: "30%",
    },
    container: {
        margin: "4me 0"
    },
    grid: {
        margin: "1em 0",
        border: `1px solid ${theme.palette.divider}`,
        width: "fit-content",
        "& p": {
            margin: "1em",
        },
    },
    text: {
        margin: "2em 0 1em 0",
    },
    headerCard: {
        borderColor: "orange"
    }
}))

const StyledTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);

function Documentation(props) {
    document.title = "Routing Bot | Documentation"
    let classes = useStyles()
    return (
        <>
            <Container maxWidth="md">
                <Typography variant="h4" className={classes.text} color="primary">Common Parameters for all endpoints.</Typography>
                <Typography className={classes.text} variant="h6">Required Parameters</Typography>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Required Parameters</StyledTableCell>
                            <StyledTableCell>Data Type</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        <StyledTableRow>
                            <TableCell>api_key</TableCell>
                            <TableCell>String</TableCell>
                            <TableCell>Your API Key</TableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                            <TableCell>points</TableCell>
                            <TableCell>Array/List</TableCell>
                            <TableCell>
                                {`A list of coordinates in "{latitude},{longitude}" format.`}
                            </TableCell>
                        </StyledTableRow>
                        <StyledTableRow>
                            <TableCell>capacity</TableCell>
                            <TableCell>Array/List</TableCell>
                            <TableCell>
                                {`A list of numbers which represent the capacity of vehicle.`}<br />
                                SUM MUST BE GREATER THAN OR EQUAL TO NUMBER OF POINTS
                            </TableCell>
                        </StyledTableRow>
                    </TableBody>
                </Table>
                <Typography className={classes.text} variant="h6">Optional Parameters</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Optional Parameters</StyledTableCell>
                            <StyledTableCell>Data Type</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>strategy</TableCell>
                            <TableCell>String</TableCell>
                            <TableCell>
                                <b>Select the Routing Strategy from following:</b><br /><br />
                                AUTOMATIC<br />
                                PATH_CHEAPEST_ARC<br />
                                PATH_MOST_CONSTRAINED_ARC<br />
                                EVALUATOR_STRATEGY<br />
                                SAVINGS<br />
                                SWEEP<br />
                                CHRISTOFIDES<br />
                                ALL_UNPERFORMED<br />
                                BEST_INSERTION<br />
                                PARALLEL_CHEAPEST_INSERTION<br />
                                LOCAL_CHEAPEST_INSERTION<br />
                                GLOBAL_CHEAPEST_ARC<br />
                                LOCAL_CHEAPEST_ARC<br />
                                FIRST_UNBOUND_MIN_VALUE<br />
                                (<b>AUTOMATIC</b> will be selected if none provided.)
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>search_option</TableCell>
                            <TableCell>String</TableCell>
                            <TableCell>
                                <b>Select the Search Option from following:</b><br /><br />
                                AUTOMATIC<br />
                                GREEDY_DESCENT<br />
                                GUIDED_LOCAL_SEARCH<br />
                                SIMULATED_ANNEALING<br />
                                TABU_SEARCH<br />
                                (<b>AUTOMATIC</b> will be selected if none provided.)
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>


                <Typography variant="h4" className={classes.text} color="primary">1. Retrieve Routes</Typography>
                <Typography className={classes.text}>Returns routes for each vehicle based on capacity.</Typography>
                <Grid container alignItems="center" className={classes.grid}>
                    <Typography>POST</Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography>https://routing-bot.herokuapp.com/api/</Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography>Parameters must be passed as JSON in request body.</Typography>
                </Grid>
                <Divider />
                <Typography className={classes.text} variant="h6">Optional Parameters</Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Optional Parameters</StyledTableCell>
                            <StyledTableCell>Data Type</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>start_point</TableCell>
                            <TableCell>String</TableCell>
                            <TableCell>
                                Shows starting address of route for each vehicle<br />
                                If not provided, first element in points is assumed starting point.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>loop</TableCell>
                            <TableCell>Boolean</TableCell>
                            <TableCell>
                                Appends starting point to route of each vehicle
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>


                <Typography variant="h4" className={classes.text} color="primary">2. Retrieve Routes With Fixed Endpoints</Typography>
                <Typography className={classes.text}>Returns routes for each vehicle based on capacity and route ending with specified endpoint.</Typography>
                <Grid container alignItems="center" className={classes.grid}>
                    <Typography>POST</Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography>https://routing-bot.herokuapp.com/api/ends/</Typography>
                    <Divider orientation="vertical" flexItem />
                    <Typography>Parameters must be passed as JSON in request body.</Typography>
                </Grid>
                <Divider />
                <Typography className={classes.text} variant="h6">Required Parameters</Typography>
                <Table>
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Required Parameters</StyledTableCell>
                            <StyledTableCell>Data Type</StyledTableCell>
                            <StyledTableCell>Description</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>start_point</TableCell>
                            <TableCell>String</TableCell>
                            <TableCell>
                                Shows starting address of route for each vehicle<br />
                                If not provided, first element in points is assumed starting point.
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>end_points</TableCell>
                            <TableCell>Array/List</TableCell>
                            <TableCell>
                                {`A list of coordinates which are ending locations in "{latitude},{longitude}" format.`}<br />
                                This must have the same length as Capacity Array.<br />
                                Duplicates are allowed. Use Start point again if no end point is to be specified for one or more of the routes.
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Container>
        </>
    )
}

export default Documentation