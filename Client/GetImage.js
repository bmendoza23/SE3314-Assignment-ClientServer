let net = require("net");
let fs = require("fs");
let open = require("open");
let ITPpacket = require("./ITPRequest");

//Variable Declaration for file name info and connection info
let connInfo = process.argv[3].split(':');
let fileName = process.argv[5].split('.');

//Connection Info
let host    = connInfo[0];
let port    = connInfo[1];

//File Info
let fName   = fileName[0];
let fType   = fileName[1];

//Request Info
let reqType = 0;

//Initializing ITP packet with the file info
ITPpacket.init(reqType, fType, fName);

//Create socket connection
let client = new net.Socket();

//Connection to server
client.connect(port, host, function(){
  //Logging connection 
  console.log('Connected to ImageDB Server on: ' + host +':'+port);
  //Sending packet through client socket
  client.write(ITPpacket.getBytePacket());   
  console.log('Request sent.');
})

const fileParts = []; //Constant array for file partitions
//Pushing partitions of bitstream received into fileParts array
client.on('data', partition => fileParts.push(partition));

//End
client.on('end', () =>{
  const responsePacket = Buffer.concat(fileParts);
  let header = responsePacket.slice(0,12);
  let file = responsePacket.slice(12);
  let resType = parseBitPacket(responsePacket, 4, 8);

  if (resType == 1){
    fs.writeFile(process.argv[5], file, 'binary', function(err, wr){
      if(!err){
        open(process.argv[5]);
      }
      else{
        console.log(err)
      }
    });
  }
  else {
    console.log("Image not in server");
  }

  //Parsing response packet into version, response type, sequence number, timestamp
  let version = parseBitPacket(responsePacket, 0, 4);
  let responseTypeNum = parseBitPacket(responsePacket, 4, 8);
  let sequenceNumber = parseBitPacket(responsePacket, 12, 20);
  let timeStamp = parseBitPacket(responsePacket, 32, 32);

  //Converting response type number to a string
  let responseType;
    if(responseTypeNum == 0){
      responseType = 'Query';
    }
    else if(responseTypeNum == 1){
      responseType = 'Found';
    }
    else if(responseTypeNum == 2){
      responseType = 'Not Found';
    }
    else if(responseTypeNum == 3){
      responseType = 'Busy';
    }

    //Print header info
    printPacketBit(header);

    //Logging response info
    console.log(
      'Server sent: ' + 
      '\n     --ITP version = ' + version +
      '\n     --Response Type = ' + responseType +
      '\n     --Sequence number = ' + sequenceNumber +
      '\n     --Timestamp = ' + timeStamp 
    )
    client.end();
});

client.on('close', function(){
  console.log('Connection terminated.');
});

client.on('end', function(){
  console.log('Server disconnected.');
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


  
