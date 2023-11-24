import React, { useCallback, useEffect, useState } from 'react';
import { View, Image, StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../api/weather';
import { weatherImages } from '../constants';
import { storeData } from '../utilis/asyncStorage';


export default function HomeScreen() {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});


    const handleLocation = (loc) => {
        console.log('location', loc);
        setLocations([]);
        toggleSearch(false);

        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data)
            console.log('got forecast: ', data);

            storeData('city', loc.name)
        })
    }

    const handleSearch = value => {
        //Fetch locations
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocations(data);
            })
        }

    }

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {

        let myCity = await getData('city');
        let cityName = "Colombo";
        if (myCity) cityName = myCity;


        fetchWeatherForecast({
            cityName: 'Colombo',
            days: '7'
        }).then(data => {
            setLocations(data);

        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

    const { current, location } = weather;
    return (



        <SafeAreaView style={styles.container}>
            <StatusBar style='light' />

            <ImageBackground
                blurRadius={60}
                source={require('../assets/bg.png')}
                style={styles.bakgroundImage}
            />

            <View style={styles.searchContainer}>
                {showSearch && (
                    <TextInput

                        onChangeText={handleTextDebounce}
                        placeholder='Search the city'
                        placeholderTextColor='lightgray'
                        style={styles.input}
                    />
                )}

                <TouchableOpacity
                    onPress={() => toggleSearch(!showSearch)} style={styles.iconContainer}>
                    <MagnifyingGlassIcon size={24} color='white' />
                </TouchableOpacity>
            </View>

            {locations.length > 0 && showSearch && (
                <View style={styles.absoluteView}>
                    {locations.map((loc, index) => (
                        <TouchableOpacity
                            onPress={() => handleLocation(loc)}
                            style={[
                                styles.itemContainer,
                                index === locations.length - 1 ? styles.lastItem : null,
                            ]}
                            key={index}
                        >
                            <Text style={styles.itemText}>
                                <MapPinIcon size='20' color='gray' />
                                {loc?.name}, {loc?.country}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/*Forecast Section*/}
            <View>

                {/*Location*/}
                <Text style={styles.cityText}>
                    {location?.name},
                    <Text style={styles.countryText}>
                        {" " + location?.country}

                    </Text>
                </Text>

                {/*WeatherImage*/}

                <View >
                    <Image style={styles.partlyImg}
                        source={weatherImages[current?.condition?.text]} />

                </View>
                <View >
                    <Text style={styles.textWithDegree}>{current?.temp_c}&deg;</Text>

                    <Text style={styles.textWithoutDegree}>{current?.condition?.text}</Text>
                </View>

                {/*Other stats*/}

                <View >
                    <Image style={styles.windImage1} source={require('../assets/wind.png')} />
                    <Text style={styles.iconText1}>{current?.wind_kph}kmph </Text>

                </View>

                <View >
                    <Image style={styles.windImage2} source={require('../assets/drop.png')} />
                    <Text style={styles.iconText2}>{current?.humidity} </Text>

                </View>

                <View >
                    <Image style={styles.windImage3} source={require('../assets/sun.png')} />
                    <Text style={styles.iconText3}>{weather?.forecast?.forecastday[0]?.astro?.sunrise} </Text>

                </View>

                {/*Forecast for next days*/}

                <View  >
                    <View>
                        <CalendarDaysIcon size='22' color='white' style={styles.forcastImg} />
                        <Text style={{ color: 'white', marginLeft: 20 }}>Daily Forecast</Text>
                    </View>

                </View>

                <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 30 }} showsHorizontalScrollIndicator={false}>

                    {
                        weather?.forecast?.forecastday?.map((item, index) => {

                            let date = new Date(item.date);
                            let options = { weekday: 'long' };
                            let dayName = date.toLocaleDateString('en-US', options);
                            dayName = dayName.split(',')[0]

                            return (
                                <View key={index} style={styles.viewImg}>
                                    <Image style={{
                                        height: 80,
                                        width: 80,
                                        marginTop: 20,
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        borderRadius: 20,
                                        marginLeft: 10
                                    }} source={weatherImages[item?.day?.condition?.text]} />
                                    <Text style={{ color: 'gray', alignSelf: 'center', fontWeight: '400' }}>{dayName}</Text>
                                    <Text style={{ color: 'white', alignSelf: 'center' }}>{item?.day?.avgtemp_c}&deg;</Text>

                                </View>
                            )
                        })
                    }

                </ScrollView>



            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    bakgroundImage: {
        flex: 1,
        width: '100%',
        height: '110%',
        resizeMode: 'cover',
        position: 'absolute',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        marginLeft: 10,
        position: 'relative',
    },
    input: {
        padding: 10,
        width: 350,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginLeft: 10,
    },
    iconContainer: {
        position: 'absolute',
        left: 320,
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#D3D3D3',
        borderBottom: 23,
        borderBottomColor: 'gray',
        backgroundColor: 'rgba(211, 211, 211, 0.3)',
        borderBottomStyle: 'solid'
    },
    absoluteView: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#D3D3D3',
        top: 120,
        borderRadius: 20,
    },
    itemContainer: {
        marginLeft: 10,

    },
    itemText: {
        padding: 8,
        borderBottomWidth: 1,
        marginLeft: 20,
        fontSize: 12,
    },
    cityText: {
        position: 'absolute',
        color: 'white',
        marginTop: 100,
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        fontSize: 40,
        fontWeight: '500',
    },
    countryText: {
        position: 'relative',
        fontSize: 20,
    },
    partlyImg: {
        height: 180,
        width: 180,
        position: 'absolute',
        marginTop: 160,
        alignSelf: 'center'
    },
    textWithDegree: {
        color: 'white',
        position: 'absolute',
        marginTop: 340,
        alignSelf: 'center',
        fontSize: 35,
        fontWeight: '500'

    },
    textWithoutDegree: {
        color: 'white',
        position: 'absolute',
        marginTop: 380,
        alignSelf: 'center',
        fontSize: 20,
        fontWeight: '400',

    },

    viewImg: {

        flex: 1,
        borderRadius: 3,
        paddingVertical: 3,
        marginBottom: 4,
        marginRight: 4,
        backgroundColor: 'white(0.2)',
    },
    windImage1: {
        position: 'absolute',
        width: 30,
        height: 30,
        marginTop: 430,
        marginLeft: 20,

    },
    windImage2: {
        position: 'absolute',
        width: 30,
        height: 30,
        marginTop: 430,
        alignSelf: 'center',

    },

    windImage3: {
        position: 'absolute',
        width: 30,
        height: 30,
        marginTop: 430,
        marginLeft: 350,

    },
    iconText1: {
        position: 'absolute',
        marginTop: 465,
        color: 'white',
        marginLeft: 25,
    },
    iconText2: {
        position: 'absolute',
        marginTop: 465,
        color: 'white',
        alignSelf: 'center',
    },
    iconText3: {
        position: 'absolute',
        marginTop: 465,
        color: 'white',
        alignSelf: 'flex-end',
    },
    forcastImg: {
        marginTop: 500,
        marginLeft: 20,
    },
    forecastScrollView: {
        marginTop: 10,
        paddingHorizontal: 10,
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginRight: -25, // Half of the size of the loading indicator
        marginTop: -25, // Half of the size of the loading indicator
    },
});
