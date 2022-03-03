//Declaring variables for the sequenceNumber, timeStamp, timer increments
let seqNumber, timeStamp;

//Random number generator (inclusive on both bounds)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    init: function() {
        timeStamp = getRandomInt(1,999); //Setting timeStamp to random number from 1-999
        seqNumber = getRandomInt(1,999); //Setting seqNumber to random number from 1-999
        //Function calls increment every 10 seconds
        setInterval(() => this.timerIncrement(), 10);
        
    },

    //Function to increment timer
    timerIncrement: function() {
        //If timeStamp greater than 2^32
        if (timeStamp >= (Math.pow(2,32))){
            timeStamp = 0;  //Reset timeStamp to 0
        }else{
            timeStamp++
        }
    },
    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
        seqNumber++;        //Increment seq number
        return seqNumber;   
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {        
        return timeStamp;
    }


};