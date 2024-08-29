import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import footballImage from '../../assets/images/football.png';
import basketballImage from '../../assets/images/basketball.png';
import golfImage from '../../assets/images/golf.png';
import tennisImage from '../../assets/images/tennis.png';
import cricketImage from '../../assets/images/cricket.png';
import paddleImage from '../../assets/images/PadelIcon.jpg';

const Pitches = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { sport } = route.params;
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const q = query(collection(db, 'events'), where('sport', '==', sport));
        const querySnapshot = await getDocs(q);
        const stadiumData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          imageUrl: doc.data().stadiumImage,
          name: doc.data().stadiumName,
          info: doc.data().stadiumInfo,
          matchStartTime: doc.data().matchStartTime,
          matchEndTime: doc.data().matchEndTime,
          directions: doc.data().directions,
          numberOfPlayers: doc.data().numberOfPlayers,
          totalPrice: doc.data().totalPrice,
        }));
        setStadiums(stadiumData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stadiums: ', error);
        setLoading(false);
      }
    };

    fetchStadiums();
  }, [sport]);

  const goToCreateEvent = () => {
    navigation.navigate('CreateEvent', { sport });
  };

  const getSportImage = (sport) => {
    switch (sport) {
      case 'Football':
        return footballImage;
      case 'Basketball':
        return basketballImage;
      case 'Golf':
        return golfImage;
      case 'Tennis':
        return tennisImage;
      case 'Cricket':
        return cricketImage;
      case 'PadelIcon':
        return paddleImage;
      default:
        return footballImage; // Default to football image if no match is found
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{sport}</Text>
      <Text style={styles.imageCount}>{stadiums.length}+ pitches</Text>
      <Image source={getSportImage(sport)} style={styles.sportImage} />
      <ScrollView contentContainerStyle={styles.imageScrollContainer}>
        {stadiums.map((stadium, index) => (
          <TouchableOpacity
            key={index}
            style={styles.imageContainer}
            onPress={() => navigation.navigate('StadiumDetail', { stadium })}
          >
            <Image source={{ uri: stadium.imageUrl }} style={styles.image} />
            <Text style={styles.stadiumName}>{stadium.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.createEventButton} onPress={goToCreateEvent}>
        <Text style={styles.createEventButtonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 120,
  },
  header: {
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#E54519',
    marginRight: 160,
    marginTop: 20,
  },
  imageCount: {
    fontSize: 16,
    color: 'grey',
    marginBottom: 40,
    marginRight: 180,
  },
  imageScrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  stadiumName: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  sportImage: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  createEventButton: {
    backgroundColor: '#FE724C',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  createEventButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Pitches;
