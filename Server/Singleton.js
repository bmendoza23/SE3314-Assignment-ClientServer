
// Some code need to be added here, that are common for the module
//Random number generator (inclusive on both bounds)
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    init: function() {
       // init function needs to be implemented here //
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
      // Enter your code here //
        return "this should be a correct sequence number";
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {        
        return  getRandomInt(1,999);
    }


};