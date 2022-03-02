let net = require("net");
let fs = require("fs");
let open = require("open");

// let ITPpacket = require("./ITPRequest"); // uncomment this line after you run npm install command

// Enter your code for the client functionality here





//// Some usefull methods ////
// Feel free to use them, but DON NOT change or add any code in these methods.

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


  
