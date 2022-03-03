let net = require("net");
let fs = require("fs");     // To access file system
let open = require("open"); // To open files

let ITPrequest = require("./ITPRequest");

//Parsing data out of entered argument

//Connection Info
let connInfo = process.argv[3].split(':');  //Connection info parsed from 3rd argument, splits at :
let host    = connInfo[0];
let port    = connInfo[1];

//File Info
let fileName = process.argv[5].split('.');  //File name parsed from 5th argument, splits at .
let fName   = fileName[0];
let fType   = fileName[1];

//Version number
let ver  = Number(process.argv[7]);         //Takes version number at 7th argument

//Request type is query
let reqType = 0;

//Variable for response packet
let resPkt;

//Initializing ITP packet with the frequest and file info
ITPrequest.init(ver, reqType, fType, fName);

//New socket for client
let client = new net.Socket();

//Connection to server
client.connect(port, host, function(){
  //Logging connection 
  console.log('Connected to ImageDB Server on: ' + host +':'+port);
  //Sending packet through client socket
  client.write(ITPrequest.getBytePacket()); 
  //Logging that request was sent.  
  console.log('Request sent.');
})

/*
  Handling receiving data response from server
*/

client.on('data', (packet) =>{
  resPkt = packet;
})

//End
client.on('end', () =>{
  //Concatonating partitions into the response packet
  let header  = resPkt.slice(0,12); //Taking header out of the response
  let file    = resPkt.slice(12);   //Parsing file info from bit data past 12th byte

  //Parsing response packet into version, response type, sequence number, timestamp
  let version         = parseBitPacket(resPkt, 0, 4);
  let responseTypeNum = parseBitPacket(resPkt, 4, 8);
  let sequenceNumber  = parseBitPacket(resPkt, 12, 20);
  let timeStamp       = parseBitPacket(resPkt, 32, 32);

  //Converting response type number to a string
  let responseType;
    switch(responseTypeNum){
      case 0:
        responseType = 'Query';
        break;
      case 1:
        responseType = 'Found';
        break;
      case 2:
        responseType = 'Not Found';
        break;
      case 3:
        responseType = 'Busy';
        break;
    }

    //Print header info
    printPacketBit(header);

    //Logging response info
    console.log(
      `Server sent: 
            --ITP version     = ${version} 
            --Response Type   = ${responseType}
            --Sequence number = ${sequenceNumber}
            --Timestamp       = ${timeStamp}`
    )
  
    //Response type = Found
    if (responseTypeNum == 1){
      //Sending file name to fs for open
      fs.writeFile(process.argv[5], file, 'binary', function(err, wr){
        //No error thrown
        if(!err){
          //Opens file
          open(process.argv[5]);
        }
        //Error thrown
        else{
          //Logs error
          console.log(err)
        }
      });
    }
    else {
      console.log("Image was not found in server.");
    }

    client.end();
});

//Handles socket close
client.on('close', function(){
  console.log('Connection terminated.');
});

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


  
