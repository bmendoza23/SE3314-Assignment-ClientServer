const res = require("express/lib/response");

//Declaring variables
const HEADER_SIZE = 12; 

var ver, responseType, sequenceNumber, timeStamp, imgSize;  //Variables to make up bitstream header

module.exports = {
    bitstreamLength: 0, //ITP Bistream Length
    bitstream: '',      //Content of bitstream
    resHeader: '',      //Content of ITP response header

    init: function (resType, seqNumber, tStamp, data, dataSize) {
        ver = 7;  //Version 7
        //Setting variables
        responseType = resType;
        sequenceNumber = seqNumber;
        timeStamp = tStamp;
        imgSize = dataSize;

        //Initializing buffer for header
        this.resHeader = new Buffer.alloc(HEADER_SIZE);

        //storeBitPacket used to put information to correct location at buffer
        storeBitPacket(this.resHeader, ver, 0, 4);              //Version                
        storeBitPacket(this.resHeader, responseType, 4, 8);     //Response type
        storeBitPacket(this.resHeader, sequenceNumber, 12, 20); //Sequence number
        storeBitPacket(this.resHeader, timeStamp, 32, 32);      //Timestamp
        storeBitPacket(this.resHeader, imgSize, 64, 32);        //Image Size
 
        this.bitstreamLength = dataSize;                //Setting bitstream length to the data size
        this.bitstream = new Buffer.alloc(dataSize);    //creating new buffer for the bitstream payload

        switch (resType){
            case 1:
                //Loop fills payload with image data
                for (var i = 0; i < dataSize; i++){
                    this.bitstream[i] = data[i];
                }
                break;
            case 2:
                 //Fill bitstream with empty bits
                for (var i = 0; i < dataSize; i++){
                this.bitstream[i] = 0;
            }
        }
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function () {
        //Declaring packet using buffer of length of bitstream + header size
        let packet = new Buffer.alloc(this.bitstreamLength + HEADER_SIZE);
        
        //Adding header to packet
        for (let i = 0; i < HEADER_SIZE; i++){
            packet[i] = this.resHeader[i];
        }
        //Adding bistream to packet
        for (let j = 0; j <this.bitstreamLength; j++)
        {
            packet[j + HEADER_SIZE] = this.bitstream[j];
        }

        return packet;
    }
};

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}