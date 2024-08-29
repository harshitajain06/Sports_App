import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { db } from '../../config/firebase';
import Modal from 'react-native-modal';

const StadiumDetail = () => {
  const route = useRoute();
  const { stadium } = route.params;

  const [currentPlayers, setCurrentPlayers] = useState(0); // Initialize with 0 initially
  const [showAlert, setShowAlert] = useState(false); // State to control alert modal
  const [hasPlayed, setHasPlayed] = useState(false); // State to track if the button has been clicked

  useEffect(() => {
    const fetchCurrentPlayers = async () => {
      try {
        const stadiumRef = doc(db, 'events', stadium.id);
        const docSnap = await getDoc(stadiumRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.currentPlayers !== undefined) {
            setCurrentPlayers(data.currentPlayers); // Set currentPlayers state with value from Firestore
          } else {
            console.log('currentPlayers field does not exist, creating...');
            await setDoc(stadiumRef, { currentPlayers: 0 }, { merge: true }); // Create currentPlayers field with initial value
            setCurrentPlayers(0); // Set currentPlayers state to initial value
          }
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching current players:', error);
      }
    };

    fetchCurrentPlayers();
  }, [stadium.id]); // Run effect when stadium.id changes

  const handlePlayButtonPress = async () => {
    try {
      if (hasPlayed) {
        return; // If button has been clicked once, do nothing
      }

      const updatedPlayers = currentPlayers + 1;
      console.log('Updated Players:', updatedPlayers);

      // Ensure stadium.id is correctly defined
      if (!stadium.id) {
        throw new Error('Stadium ID is not defined');
      }

      // Check if updatedPlayers exceed numberOfPlayers
      if (updatedPlayers > stadium.numberOfPlayers) {
        setShowAlert(true); // Show custom alert modal
        return;
      }

      // Create a reference to the Firestore document
      const stadiumRef = doc(db, 'events', stadium.id);
      console.log('Stadium Ref:', stadiumRef);

      // Update the number of players and currentPlayers in Firestore
      await updateDoc(stadiumRef, {
        currentPlayers: updatedPlayers, // Update currentPlayers field
      });

      // Update state to reflect the changes
      setCurrentPlayers(updatedPlayers);
      setHasPlayed(true); // Set hasPlayed to true after first click
    } catch (error) {
      console.error('Error updating players:', error);
      setShowAlert(true); // Show custom alert modal for generic errors
    }
  };

  const closeModal = () => {
    setShowAlert(false); // Function to close the custom alert modal
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: stadium.imageUrl }} style={styles.stadiumImage} />
      <Text style={styles.title}>{stadium.name}</Text>
      <Text style={styles.info}>{stadium.info}</Text>
      <Text style={styles.label}>Number of Players: {currentPlayers}/{stadium.numberOfPlayers}</Text>
      <Text style={styles.label}>Total Price: {stadium.totalPrice}</Text>
      <Text style={styles.label}>Timings: {stadium.matchStartTime} - {stadium.matchEndTime} PM</Text>
      <Text style={styles.label}>Directions: {stadium.directions}</Text>
      <TouchableOpacity
        style={[styles.playButton, hasPlayed && styles.disabledButton]}
        onPress={handlePlayButtonPress}
        disabled={hasPlayed}
      >
        <Text style={styles.playButtonText}>PLAY</Text>
      </TouchableOpacity>

      {/* Custom Alert Modal */}
      <Modal isVisible={showAlert} onBackdropPress={closeModal}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertText}>Maximum number of players reached.</Text>
          <TouchableOpacity style={styles.okButton} onPress={closeModal}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },
  stadiumImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginLeft: 15,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginBottom: 20,
  },
  playButton: {
    backgroundColor: '#FE724C',
    borderRadius: 20,
    padding: 8,
    width: '40%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 'auto',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.6,
  },
  alertContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: '#FE724C',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StadiumDetail;
