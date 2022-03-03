//Header Size Variable
var HEADER_SIZE = 12;
//Global variable declaration
var version, timeStamp, imgExt, fileName;

module.exports = {
  //Bitstream components
  bitstreamLength: 0,   //Length of bitstream
  bitstream: '',        //Bitstream
  requestHeader: '',    //ITP Request header

  init: function (reqType, fType, fName) {
    version = 7;

    //Setting variables
    requestType = reqType;
    timeStamp = 0;
    imgExt = fType;
    fileName = fName;

    //Sets bitstreamlength to size of file name string
    let fileNameString = stringToBytes(fileName);
    this.bitstreamLength = fileNameString.length;

    //Converting file extension to a number
    let imgExtNum;
    if(imgExt == 'bmp'){
      imgExtNum = 1;
    }
    else if(imgExt == 'jpeg'){
      imgExtNum = 2;
    }
    else if(imgExt == 'gif'){
      imgExtNum = 3;
    }
    else if(imgExt == 'png'){
      imgExtNum = 4;
    }
    else if(imgExt == 'tiff'){
      imgExtNum = 5;
    }
    else if(imgExt == 'raw'){
      imgExtNum = 15;
    }

    //Creating a buffer for the request header of the length of the header size
    this.requestHeader = new Buffer.alloc(HEADER_SIZE);
    storeBitPacket(this.requestHeader, version, 0 , 4);                     //Version
    storeBitPacket(this.requestHeader, reqType, 24, 8);               //Request type
    storeBitPacket(this.requestHeader, timeStamp, 32, 32);            //Timestamp
    storeBitPacket(this.requestHeader, imgExtNum, 64, 4);             //File extension
    storeBitPacket(this.requestHeader, this.bitstreamLength, 68 ,28); //Bitstream length

    //Creating buffer for bitstream
    this.bitstream = new Buffer.alloc(fileNameString.length);

    //Loops over length of filename string, copied filename string to bitstream
    for(var i = 0; i < fileNameString.length; i++){
      this.bitstream[i] = fileNameString[i];
    }

  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    let packet = new Buffer.alloc(this.bitstreamLength + HEADER_SIZE);
    
    for(let i = 0; i < HEADER_SIZE; i++){
      packet[i] = this.requestHeader[i];
    }
    for(let j = 0; j < this.bitstreamLength; j++){
      packet[j + HEADER_SIZE] = this.bitstream[j];
    } 
    return packet;
  },
};

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
