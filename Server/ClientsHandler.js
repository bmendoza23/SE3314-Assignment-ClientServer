let ITPpacket = require('./ITPResponse');   //Importing ITPResponse modules 
let singleton = require('./Singleton');     //Importing Singleton modules
const fs = require('fs');                   //To read files from file system
const { start } = require('repl');

//Global variables
var clientIDs      = {},
    clientAddress   = {}, 
    startTime       = {};

module.exports = {

    //Handles new cliet joining, takes a socket as the parameter
    handleClientJoining: function (sock) {
        setClientID(sock, clientIDs);   //sets clientID
        //Logging Client names
        console.log(clientIDs[sock.id] + " connected at timestamp: " + startTime[sock.id]);
        
    }
};
//Prints client packet info to terminal window
function logClientPacketInfo(data, sock){
    //Parsing bitstream received
    let v                   = parseBitPacket(data, 0, 4);       //Version
    let reqTypeRec          = parseBitPacket(data, 24, 8);      //Request type
    let timeStamp           = parseBitPacket(data, 32, 32);     //Time Stamp
    let fileExtRec          = parseBitPacket(data, 64, 4);      //File extension

    let fileName = bytesToString(data.slice(12));                   //data from packet sliced

    //Converting request type
    let requestType;
    if(reqTypeRec == 0){
        requestType = 'Query';
    }
    else if(reqTypeRec == 1){
        requestType = 'Found';
    }
    else if(reqTypeRec == 2){
        requestType = 'Not Found';
    }
    else if(reqTypeRec == 3){
        requestType = 'Busy';
    }

    //Convert file extension 
    let fileExt;
    if (fileExtRec == 1){
        fileExt = "BMP";
    }
    else if (fileExtRec == 2){
        fileExt = "JPEG";
    }
    else if (fileExtRec == 3){
        fileExt = "GIF";
    }
    else if (fileExtRec == 4){
        fileExt = "PNG";
    }
    else if (fileExtRec == 5){
        fileExt = "TIFF";
    }
    else if (fileExtRec == 15){
        fileExt = "RAW";
    }
    //Logging info to console
    printPacketBit(data);
    console.log(
        '\n' + clientIDs[sock.id] + ' requests:' +
        '\n    --ITP Version: ' + v +
        '\n    --Timestamp: ' + timeStamp +
        '\n    --Request Type: ' + requestType +
        '\n    --Image File Extension(s) ' + fileExt +
        '\n    --Image File Name: ' + fileName
    );

    //Read file
    fs.readFile('images/' + fileName + '.' + fileExt.toLowerCase(), (err, data) => {
        const fileParts = [];
        //No error thrown
        if (!error){
            //Creates readstream containing file
            var readFile = fs.createReadStream('images/' + fileName + '.' + fileExt.toLowerCase());

            //Putting file partitions into array
            readFile.on('data', function (partition){
                fileParts.push(partition);      //pushing file partitions into fileParts
            });
            //Finalizing packet
            readFile.on('close', function(){
                //concatonating fileParts into a single variable
                let file = Buffer.concat(fileParts);
                //creating a packet with seq number, timestamp, and file info
                ITPpacket.init(1, singleton.getSequenceNumber(), singleton.getTimestamp(), file, file.length);
                //Sending packet through socket
                sock.write(ITPpacket.getPacket());
                //Closing connection
                sock.end();
            })
        }
        //Error thrown
        else {
            //Responding to error, creating empty packet with response type 2
            ITPpacket.init(2, singleton.getSequenceNumber(), singleton.getTimestamp(), 0, 0);
            //Sending ITP packet to the socket
            sock.write(ITPpacket.getPacket());
            //Closing connection
            sock.end();
            //Logging error to console 
            console.log('\n ERROR: File not found.');
        }
    })
}

//Assigns ID to aclients
function setClientID(sock, clientIDs){
    //Creating ID for the socket
    sock.id = sock.remAddress + ":" + sock.remPort;

    //Asssigning the index of the startTime array as the timestamp from the singleton
    startTime[sock.id] = singleton.getTimestamp();

    //Giving the name to the client by concatonating the timestamp with the client
    var name = 'client-' + startTime[sock.id];  //Sets local variable name
    clientIDs[sock.id] = name;                  //Stores name in the client names array
    clientAddress[sock.id] = sock.remAddress;   //Stores socket address in clientAddress array

}

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}