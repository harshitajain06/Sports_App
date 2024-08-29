import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';

const CreateEvent = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sport } = route.params;
  const [stadiumName, setStadiumName] = useState('');
  const [stadiumInfo, setStadiumInfo] = useState('');
  const [numberOfPlayers, setNumberOfPlayers] = useState('');
  const [matchStartTime, setMatchStartTime] = useState('');
  const [matchEndTime, setMatchEndTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [directions, setDirections] = useState('');
  const [totalPrice, setTotalPrice] = useState(''); // New state variable for total price
  const [stadiumImage, setStadiumImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setStadiumImage(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!stadiumName || !stadiumInfo || !numberOfPlayers || !matchStartTime || !matchEndTime || !selectedDate || !stadiumImage || !directions || !totalPrice) {
      Alert.alert('Error', 'Please fill all the fields, select a date, and choose an image.');
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();
      const response = await fetch(stadiumImage);
      const blob = await response.blob();
      const imageRef = ref(storage, `images/${Date.now()}_${stadiumName}`);
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'events'), {
        sport,
        stadiumName,
        stadiumInfo,
        numberOfPlayers,
        matchStartTime,
        matchEndTime,
        matchDate: selectedDate,
        stadiumImage: imageUrl,
        directions,
        totalPrice, // Include total price in the database entry
      });

      Alert.alert('Success', 'Event created successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating event: ', error);
      Alert.alert('Error', 'There was an error creating the event. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setMatchStartTime(selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setMatchEndTime(selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Create Event for {sport}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Stadium Name"
              placeholderTextColor="#8A8A8A"
              value={stadiumName}
              onChangeText={setStadiumName}
            />
            <TextInput
              style={styles.input}
              placeholder="Stadium Info"
              placeholderTextColor="#8A8A8A"
              value={stadiumInfo}
              onChangeText={setStadiumInfo}
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Players"
              placeholderTextColor="#8A8A8A"
              value={numberOfPlayers}
              onChangeText={setNumberOfPlayers}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowStartTimePicker(true)}>
              <Text style={styles.timePickerButtonText}>{matchStartTime ? `Start Time: ${matchStartTime}` : 'Select Start Time'}</Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
            <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowEndTimePicker(true)}>
              <Text style={styles.timePickerButtonText}>{matchEndTime ? `End Time: ${matchEndTime}` : 'Select End Time'}</Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Add Directions"
              placeholderTextColor="#8A8A8A"
              value={directions}
              onChangeText={setDirections}
            />
            <TextInput
              style={styles.input} // New TextInput for Total Price
              placeholder="Total Price"
              placeholderTextColor="#8A8A8A"
              value={totalPrice}
              onChangeText={setTotalPrice}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
              <Text style={styles.imagePickerText}>Pick an Image</Text>
            </TouchableOpacity>
            {stadiumImage && <Image source={{ uri: stadiumImage }} style={styles.imagePreview} />}
            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowCalendar(!showCalendar)}>
              <Text style={styles.datePickerButtonText}>Select Date</Text>
            </TouchableOpacity>
            {selectedDate ? <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text> : null}
            {showCalendar && (
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#FE724C' },
                }}
                style={styles.calendar}
              />
            )}
          </View>
          {uploading ? (
            <TouchableOpacity style={[styles.createButton, styles.disabledButton]} disabled>
              <Text style={styles.createButtonText}>Uploading...</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
              <Text style={styles.createButtonText}>Create Event</Text>
            </TouchableOpacity>
          )}
          <Image source={require('../../assets/images/team.png')} style={styles.teamImage} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topBar: {
    backgroundColor: '#007BFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 50,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  inputContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 5, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 }, // For iOS
    shadowOpacity: 0.25, // For iOS
    shadowRadius: 3.84, // For iOS
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  timePickerButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  timePickerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  imagePicker: {
    backgroundColor: '#007BFF',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 18,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 20,
    borderRadius: 10,
  },
  datePickerButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  selectedDateText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#FE724C',
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  teamImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginTop: 20,
    borderRadius: 10,
  },
});

export default CreateEvent;
