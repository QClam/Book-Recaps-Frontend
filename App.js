import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Onboarding from "./components/Onboarding";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";

import { Ionicons } from '@expo/vector-icons'
import RecapDetail from "./components/Books/RecapDetail";
import RecapItemDetail from "./components/Books/RecapItemDetail";
import RecapScreen from "./screens/RecapScreen";
import PlaylistScreen from "./screens/PlaylistScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Playlist") {
                        iconName = focused ? "list" : "list-outline";
                    } else if (route.name === "Recap") {
                        iconName = focused ? "albums" : "albums-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#007AFF",
                tabBarInactiveTintColor: "gray",
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: "Home" }}
            />
            <Tab.Screen
                name="Playlist"
                component={PlaylistScreen}
                options={{ title: "Playlist" }}
            />
            <Tab.Screen
                name="Recap"
                component={RecapScreen}
                options={{ title: "Recap" }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [viewOnboarding, setViewOnboarding] = useState(false);

    const checkOnboarding = async () => {
        try {
            const value = await AsyncStorage.getItem("@viewedOnboarding");

            if (value === null) {
                setViewOnboarding(true);
            }
        } catch (error) {
            console.log("Error @viewedOnboarding", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkOnboarding();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }


    return (
        <NavigationContainer>
            <SafeAreaView style={{ flex: 1 }}>
                <Stack.Navigator>
                    {viewOnboarding && (
                        <Stack.Screen
                            name="Onboarding"
                            component={Onboarding}
                            options={{ headerShown: false }}
                        />
                    )}
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Tabs"
                        component={TabNavigator}
                        options={{ headerShown: false }}
                    />

                        <Stack.Screen
                            name="RecapDetail"
                            component={RecapDetail}
                            options={{ title: "Detail" }}
                        />
                        <Stack.Screen
                            name="RecapItemDetail"
                            component={RecapItemDetail}
                            options={{ title: "Detail Recap" }}
                        />
                </Stack.Navigator>
                <StatusBar style="auto" />
            </SafeAreaView>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
