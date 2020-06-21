import * as React from "react";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import "./index.css";
import { useEffect, useState } from "react";
import {
    CssBaseline, AppBar, Toolbar, Typography,
    Drawer, Divider, Card, CardContent, Box,
    FormLabel, RadioGroup, FormControl,
    FormControlLabel, Radio, Container
} from "@material-ui/core";
import { getPreciseDistance } from 'geolib';
import firebase from "./services/firestore";
import Skeleton from '@material-ui/lab/Skeleton';
import { useStyles } from "./useStyles";

import { HISTORY } from './graphql/mutation';
import { useQuery } from '@apollo/react-hooks';
export const drawerWidth = "30%";

export default function Home() {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue
    } = usePlacesAutocomplete();

    //START

    const [lng, setLng] = useState(0);
    const [, setLoading] = useState(false);
    const [lat, setLat] = useState(0);
    const [typeName, setTypeName] = useState("Hospital");
    const [history, setHistory] = useState<any>([]);
    const [address, setAddress] = useState("");
    const [distance, setDistance] = useState<string | number>("2000");
    const [distanceApart] = useState<number>();
    const [hospitals, setHospitals] = useState([{
        "id": "",
        "name": "",
        "rating": "",
        "user_ratings_total": "",
        "vicinity": ""
    }]);

    const { loading, error, data, refetch } = useQuery(HISTORY, {
        variables: {
            id: userId
        }
    })

    useEffect(() => {
        if (data && data.history) {
            setHistory(data.history)
        }
    }, [data])
    // const handleUserLocation = () => {
    //     navigator.geolocation.getCurrentPosition((position: Position) => {
    //         setLat(position.coords.latitude)
    //         setLng(position.coords.longitude)
    //     }, (error: any) => {
    //         return error
    //     },
    //     );
    // }

    useEffect(() => {
        const getHospitals = async () => {
            setLoading(true)
            const proxyurl = "https://cors-anywhere.herokuapp.com/";
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${distance}&types=health&name=${typeName}&key=AIzaSyBEnXuoaWR0E7pKgnbgJqKJJZCV4er09n0`
            let response = await fetch(proxyurl + url);
            return await response.json();
        };
        // handleUserLocation()
        getHospitals()
            .then(hospital => {
                setHospitals(hospital.results);
                // let disbtw = getPreciseDistance(
                //     { latitude: lat, longitude: lng },
                //     { latitude: lat, longitude: lng }
                // );
                // let d = `distance apart ${Number(disbtw) / 1000}`
                // console.log({
                //     d
                // });
                addSearch()
                setLoading(false)
            });
    }, [distance, lat, lng, typeName]);
    //END

    const addSearch = () => {
        if (lat !== 0 && lng !== 0 && distance !== "" && typeName !== "" && address !== "") {

            firebase.firestore().collection("searches").add({
                // created: firebase.firestore.FieldValue.serverTimestamp(),
                lat: lat,
                lng: lng,
                radius: distance,
                type: typeName,
                address: address,
                // distance: distanceApart

            })
        } else {
            console.log("no data to save");
        }
    };

    useEffect(() => {

        firebase

            .firestore()

            .collection("searches")

            .onSnapshot(snapshot => {

                const lists = snapshot.docs.map(doc => ({

                    id: doc.id,

                    ...doc.data(),

                }));

                setHistory(lists);
                console.log(lists);

            })

    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setValue(e.target.value);
    };

    const handleTypeChange = (event: React.ChangeEvent<{ value: string }>) => {
        setTypeName(event.target.value);
    };
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        event.preventDefault();
        setDistance(event.target.value as number);
    };

    const handleSelect = (val: string): void => {
        setValue(val, false);
        setAddress(val)
        getGeocode({ address: val })
            .then(results => getLatLng(results[0]))
            .then(({ lat, lng }) => {
                console.log('📍 Coordinates: ', { lat, lng, distance });
                setLat(lat);
                setLng(lng);
            }).catch(error => {
                console.log('😱 Error: ', error)
            });
    };


    const renderSuggestions = (): JSX.Element => {
        const suggestions = data.map(({ id, description }: any) => (
            <ComboboxOption key={id} value={description} />
        ));

        return (
            <>
                {suggestions}
                <li className="logo">
                    <img
                        src="https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png"
                        alt="Powered by Google"
                    />
                </li>
            </>
        );
    };


    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        Hospital search
                    </Typography>
                </Toolbar>
            </AppBar>
            <main className={classes.content}>
                <div className={classes.toolbar} />
                <Box textAlign="center" m={1}>
                    <Typography component="h2" variant="h5">
                        Stay safe, Stay healthy...
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="center">
                    <Combobox onSelect={handleSelect} aria-labelledby="demo">
                        <ComboboxInput
                            style={{ width: 500, maxWidth: "90%", height: 40 }}
                            value={value}
                            onChange={handleInput}
                            disabled={!ready}
                            placeholder="Search your location"
                        />
                        <ComboboxPopover>
                            <ComboboxList>{status === "OK" && renderSuggestions()}</ComboboxList>
                        </ComboboxPopover>
                    </Combobox>
                </Box>
                <Box display="flex" justifyContent="center" m={2}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Search for?</FormLabel>
                        <RadioGroup row={true} aria-label="Range" name="range" value={typeName} onChange={handleTypeChange}>
                            <FormControlLabel value="Hospital" control={<Radio />} label="Hospital" />
                            <FormControlLabel value="Clinic" control={<Radio />} label="Clinic" />
                            <FormControlLabel value="Medical Office" control={<Radio />} label="Medical Office" />
                            <FormControlLabel value="Pharmacy" control={<Radio />} label="Pharmacy" />
                        </RadioGroup>
                    </FormControl>
                </Box>
                <Box display="flex" justifyContent="center">
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Within</FormLabel>
                        <RadioGroup row={true} aria-label="Range" name="range" value={distance} onChange={handleChange}>
                            <FormControlLabel value="2000" control={<Radio />} label="2km" />
                            <FormControlLabel value="5000" control={<Radio />} label="5km" />
                            <FormControlLabel value="10000" control={<Radio />} label="10km" />
                            <FormControlLabel value="20000" control={<Radio />} label="20km" />
                        </RadioGroup>
                    </FormControl>

                </Box>

                <div>
                    {/* <Skeleton animation="wave" /> */}
                    {hospitals.map(item => (
                        <Box m={2}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography variant="h6">
                                        {item.name}
                                    </Typography>
                                    <Typography variant="subtitle1">
                                        {item.vicinity}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {item.rating}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    ))}
                </div>
            </main>
            <Drawer
                className={classes.drawer}
                variant="permanent"
                classes={{
                    paper: classes.drawerPaper,
                }}
                anchor="right"
            >
                <Box textAlign="center" m={2}>
                    <Typography variant="h5">
                        Search history
                    </Typography>
                </Box>
                <Divider />
                <Container>
                    <div>
                        {history.map((item: { type: React.ReactNode; address: React.ReactNode; }) => (
                            <Box m={2}>
                                <Card>
                                    <CardContent>
                                        <Typography variant='body1'>{item.type}</Typography>
                                        <Typography variant='caption'>{item.address}</Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </div>
                </Container>
            </Drawer>
        </div>
    )
}
