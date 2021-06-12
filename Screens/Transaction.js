import * as React from 'react';
import {Text,View,StyleSheet,TouchableOpacity,TextInput,Image,KeyboardAvoidingView, Alert, ToastAndroid} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../config';
import * as firebase from 'firebase';

export default class Transaction extends React.Component {
  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted',
      buttonState: id,
      scan: false,
    });
  };

  handleBarCodeScanned = async ({ data }) => {
    const { buttonState } = this.state;
    if (buttonState === 'BookId') {
      console.log(buttonState);
      this.setState({
        scan: true,
        scannedBookId: data,
        buttonState: 'normal',
      });
    } else if (buttonState === 'StudentId') {
      this.setState({
        scan: true,
        scannedStudentId: data,
        buttonState: 'normal',
      });
    }
  };

  handleTransaction = async () => {
    var transactionMessage = ""
    db.collection('Books')
      .doc(this.state.scannedBookId)
      .get()
      .then((doc) => {
        console.log(doc.data());
        var book = doc.data();
        if (book.Avail) {
          this.initiateBookIssue();
          transactionMessage = "Book Issued"
          console.log(transactionMessage)
          ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
          
        } else {
          this.initiateBookReturn();
          transactionMessage = "Book Returned"
          console.log(transactionMessage)
          ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
            
        }

        this.setState({transactionMessage:transactionMessage})

      });
  };

  initiateBookIssue = async () => {
    db.collection('Transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      transactionType: 'issue',
      date: firebase.firestore.Timestamp.now().toDate(),
    });

    db.collection('Books').doc(this.state.scannedBookId).update({
      Avail: false,
    });

    db.collection('Students')
      .doc(this.state.scannedStudentId)
      .update({
        OwnedCount: firebase.firestore.FieldValue.increment(1),
      });

    this.setState({scannedBookId:'', scannedStudentId:''})
    
  };

  initiateBookReturn = async () => {
    db.collection('Transaction').add({
      studentId: this.state.scannedStudentId,
      bookId: this.state.scannedBookId,
      transactionType: 'return',
      date: firebase.firestore.Timestamp.now().toDate(),
    });

    db.collection('Books').doc(this.state.scannedBookId).update({
      Avail: true,
    });

    db.collection('Students')
      .doc(this.state.scannedStudentId)
      .update({
        OwnedCount: firebase.firestore.FieldValue.increment(-1),
      });

    this.setState({scannedBookId:'', scannedStudentId:''})
  };

  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scan: false,
      scannedData: '',
      buttonState: 'normal',
      scannedBookId: '',
      scannedStudentId: '',
      transactionMessage:"",
    };
  }

  render() {
    const hasCameraPermission = this.state.hasCameraPermission;
    const scanned = this.state.scan;
    const buttonState = this.state.buttonState;

    if (buttonState !== 'normal' && hasCameraPermission) {
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === 'normal') {
      return (
        <KeyboardAvoidingView style={styles.appHeader} behavior = "padding" enabled>
          <Image
            source={require('../assets/booklogo.jpg')}
            style={{ width: 100, height: 100, marginLeft: 100 }}
          />
          <View style={styles.container}>
            <View style={styles.view}>
              <TextInput style = {styles.input}
                placeholder="Book Id"
                value={this.state.scannedBookId}
                onChangeText = {text=>this.setState({scannedBookId:text})}
              />

              <TouchableOpacity style = {styles.scan}
                onPress={() => {
                  this.getCameraPermission('  BookId');
                }}>
                <Text> Scan</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.view}>
              <TextInput style = {styles.input}
                placeholder="Student Id"
                value={this.state.scannedStudentId}
                onChangeText = {text=>this.setState({scannedStudentId:text})}
              />
              <TouchableOpacity style = {styles.scan}
                onPress={() => {
                  this.getCameraPermission('StudentId');
                }}>
                <Text style = {{textAlign:"center"}}> Scan</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style = {styles.submit}
              onPress={async () => {
                this.handleTransaction();
              }}>
              <Text style = {{alignSelf:"center", fontSize:18}}>Submit</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  appHeader: {
    flex: 1,
  },
  button: {
    backgroundColor: 'aqua',
    width: 120,
    alignSelf: 'center',
    height: 40,
    marginTop: 80,
    justifyContent: 'center',
  },
  text: {
    alignSelf: 'center',
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  view: {
    flexDirection: 'row',
  },
  scan:{
    flexDirection:'row',
    borderRadius:20,
    borderWidth:2,
    width:70,
    justifyContent:"center",
    marginTop:20,
    backgroundColor:"lightgrey"
  },
  input:{
    marginTop:20,
    borderRadius:20,
    borderWidth:2,
    width:120,
    marginRight:40,
    marginLeft:30,
    backgroundColor:"lightgrey",
    textAlign:"center",
    placeholderTextColor:"black"
  },
  submit:{
    borderRadius:20,
    borderWidth:3,
    width:100,
    backgroundColor:"aqua",
    marginTop:50,
    marginLeft:100,
    height:30
  }
});
