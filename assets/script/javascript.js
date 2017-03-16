// Initialize Firebase
var config = {
apiKey: "AIzaSyAXt8uh1dvjnDGiqz5A7pvkOMINEVrZRLE",
authDomain: "traintimes-83d4b.firebaseapp.com",
databaseURL: "https://traintimes-83d4b.firebaseio.com",
storageBucket: "traintimes-83d4b.appspot.com",
messagingSenderId: "539527111260"
};
firebase.initializeApp(config);
var db = firebase.database();

 
// function addTrain adds train row to HTML
function addTrain(newTrain) {
	// some values are calculated on the fly
	var tFrequency = newTrain.frequency;
	var firstTime = moment(newTrain.firstTime, "H HH").subtract(1,"years"); // string in 24 hour format, subtracted 1 year
	var diffTime = moment().diff(moment(firstTime), "minutes");
	var tRemainder = diffTime % tFrequency;
	var tMinutesTillTrain = tFrequency - tRemainder;
	var nextTrain = moment().add(tMinutesTillTrain, "minutes");

	$("#trainTable").children("tbody").append("<tr><td>"+newTrain.name+"</td><td>"+newTrain.destination+"</td><td>"+newTrain.frequency+"</td><td>"+tMinutesTillTrain+"</td><td>"+moment(nextTrain).format("hh:mm")+"</td></tr>");
}

$(document).ready(function(){

// set click listener on submit button
// set click listener on input form
$("#trainSubmit").on("click",function(event){
	// don't reload
	event.preventDefault();
	// collect inputs into an array
	formSubmit();
}); // end submit function	
	
function formSubmit(){
	var inputs = $("input");

	// we'll check inputs for empties
	// create a flag
	var incomplete = false;
	// loop through inputs looking for empty values		
	$(inputs).each(function(index){
		if ($(this).val()=='') {
			// empty input? set the flag and warn user
			incomplete = true;
			$(this).addClass('empty').attr("placeholder","Required");
		}
	});

	// after looping through inputs, if incomplete flag remains false, build train object and push it to firebase
	if (!incomplete) {
		var thisTrain = {
			name:inputs[0].value,
			destination:inputs[1].value,
			firstTime:inputs[2].value,
			frequency:inputs[3].value
		};
		console.log(thisTrain);
		db.ref().push(thisTrain);
		// now empty the inputs and restore non-warning state/placeholders
		$("#trainInput").val('').attr("placeholder","Train Name").removeClass("empty");
		$("#destinationInput").val('').attr("placeholder","Where is it headed?").removeClass("empty");
		$("#firstTimeInput").val('').removeClass("empty");
		$("#frequencyInput").val('').attr("placeholder","Time in minutes").removeClass("empty");
	} 
}

// this is the first code executed
// grab existing data from firebase
// when doc loads, listen for all children (if any) in firebase and sends .val() to addTrain function to build table

db.ref().on('child_added',function(childSnapshot){
	addTrain(childSnapshot.val());
	});	


}) // end ready function

/* 
snapshot:

train name: {
	destination: ,
	firstTime: ,
	frequency: 		
} 

*/