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
// localSnapshot array holds train objects to aid in auto-updating times
localSnapshot=[];
 
// function addTrain adds train row to HTML
function addTrain(newTrain) {
	// some values are calculated on the fly
	var tFrequency = newTrain.frequency;
	var firstTime = moment(newTrain.firstTime, "H HH").subtract(1,"years"); // string in 24 hour format, subtracted 1 year
	var diffTime = moment().diff(moment(firstTime), "minutes");
	var tRemainder = diffTime % tFrequency;
	var tMinutesTillTrain = tFrequency - tRemainder;
	var nextTrain = moment().add(tMinutesTillTrain, "minutes");
	$("#trainTable").children("tbody").append("<tr><td>"+newTrain.name+"</td><td>"+newTrain.destination+"</td><td>"+newTrain.frequency+"</td><td>"+moment().add(tMinutesTillTrain,"minutes").format("hh:mm a")+"</td><td>"+tMinutesTillTrain+"</td></tr>");
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
	console.log('checking times');
	// don't continue to add new intervals with each train addition
	clearInterval(autoCheck);
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
		db.ref().push(thisTrain);
		// now empty the inputs and restore non-warning state/placeholders
		$("#trainInput").val('').attr("placeholder","Train Name").removeClass("empty");
		$("#destinationInput").val('').attr("placeholder","Where is it headed?").removeClass("empty");
		$("#firstTimeInput").val('').removeClass("empty");
		$("#frequencyInput").val('').attr("placeholder","Time in minutes").removeClass("empty");
	} 
}
// function to auto-update time calculations in table
function updateTimes(){
	// loop through table rows, find time elements and update them based on current time
	$("tbody").children("tr").each(function(index){
		var uFrequency = localSnapshot[index].frequency;
		// string in 24 hour format, subtracted 1 year
		var firstTime = moment(localSnapshot[index].firstTime, "H HH").subtract(1,"years");
		// minutes from first train time to now, in minutes 
		var diffTime = moment().diff(moment(firstTime), "minutes");
		// total minutes modulo frequency gives you time until next train
		var uRemainder = diffTime % uFrequency;
		// frequency minus time to next train is minutes to next train
		var uMinutesTillTrain = uFrequency - uRemainder;
		// next train time is time now + minutes to next train
		var nextTrain = moment().add(uMinutesTillTrain, "minutes").format("hh:mm a");
		// update cells with new calculations
		$(this).children("td").eq(3).text(nextTrain);
		$(this).children("td").eq(4).text(uMinutesTillTrain);
	});
}
// this is the first code executed
// grab existing data from firebase
// when doc loads, listen for all children (if any) in firebase and sends .val() to addTrain function to build table

db.ref().on('child_added',function(childSnapshot){
	// create local version of db for auto-update purposes (need frequency, first time data)
	localSnapshot.push(childSnapshot.val());
	addTrain(childSnapshot.val());
	});	

//create interval to auto-update train times once per minute
var autoCheck = setInterval(updateTimes,10000);

}) // end ready function

