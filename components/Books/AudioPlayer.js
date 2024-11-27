import { Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Sound from 'react-native-sound';

const AudioPlayer = ({ audioURL }) => {

    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const loadSound = () => {
        const newSound = new Sound(audioURL, null, (error) => {
            if (error) {
                console.error('Error loading sound:', error);
                return;
            }
            console.log('Sound loaded successfully');
            setSound(newSound);
        });
    }

    const togglePlayPause = () => {
        if (sound) {
            if (isPlaying) {
                sound.pause();
            } else {
                sound.play((success) => {
                    if (!success) {
                        console.error('Playback failed due to audio decoding errors');
                    }
                });
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Giải phóng tài nguyên khi không cần thiết nữa
    const releaseSound = () => {
        if (sound) {
            sound.release();
            setSound(null);
            setIsPlaying(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={togglePlayPause} style={styles.button}>
                <Text style={styles.buttonText}>
                    {isPlaying ? 'Pause' : 'Play'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

export default AudioPlayer

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        alignItems: 'center',
    },
    button: {
        padding: 12,
        backgroundColor: '#007BFF',
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
})