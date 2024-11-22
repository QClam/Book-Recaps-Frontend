import { FlatList, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import React, { useState } from "react";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import LoginScreen from "./Login";
import RegisterScreen from "./Register";

const loginRoute = () => <LoginScreen />
const registerRoute = () => <RegisterScreen />

const LoginNRegister = () => {

    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        {key: 'login', title: 'Login'},
        {key: 'register', title: 'Register'}
    ])

    const renderScene = SceneMap({
        login: loginRoute,
        register: registerRoute
    })

    const renderTabBar = props => (
        <TabBar 
        {...props}
        indicatorStyle={{backgroundColor: "#FFF", height: 2}} //underline CSS
        style={{backgroundColor: "#008000"}} //background CSS
        labelStyle={{ color: '#FFFFFF', fontWeight: 'bold' }} // White text
        tabStyle={{ paddingBottom: 0 }} // Align text with underline
        />
    )

  return (
    <SafeAreaView style={styles.container}>

      <TabView 
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={renderTabBar}
      />
  
      </SafeAreaView>
  );
};

export default LoginNRegister;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#008000", // Matches the tab bar color for a consistent look,
        paddingTop: 50
      },
});
