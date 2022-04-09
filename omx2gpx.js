class OMHFile {
  constructor(data) {
    this.data = data;
    this.header = null;
    this.load();
  }
  
  load(data) {
  data = typeof data == 'object' && Array.isArray(data) ? data : this.data;
  this.data = data;
    let dataview = new DataView(data);
    //console.log(name + ' ('+dataview.byteLength+' o)');
    //console.log(dataview.getUint32(0, true)+' m');
    //console.log(dataview.getUint16(4, true)+' s');
    this.data = 
    {
      'nDistance':dataview.getUint32(0, true),        // In meters.
      'nTime':dataview.getUint16(4, true),            // In seconds.
      'nSpeedAvg':dataview.getUint16(6, true),        // In decameters/h.
      'nSpeedMax':dataview.getUint16(8, true),        // In decameters/h.
      'nKCal':dataview.getUint16(10, true),
      'nHeartRateAvg':dataview.getUint8(12, true),    // In bpm.
      'nHeartRateMax':dataview.getUint8(13, true),    // In bpm.

      // Date and time of session.
      'nYear':dataview.getUint8(14, true),            // +2000
      'nMonth':dataview.getUint8(15, true),
      'nDay':dataview.getUint8(16, true),
      'nHours':dataview.getUint8(17, true),
      'nMinutes':dataview.getUint8(18, true),

      'nFileNumber0':dataview.getUint8(19, true),    // Fn0 ':': Fn1 ':': Fn2.

      'nGPSPoints':dataview.getUint16(20, true),        // Number of GPS points recorded in OMD. The count does NOT include 'curve' records!
      'nGPSOff':dataview.getUint8(22, true),        // 0 ': GPS on. / *** off? to test: non zero assumed ***

      'pReserved0':dataview.getUint8(23, true),     //[15]       // *** t[0] ': 1 when cardio belt present. (bit or byte ?).

      'nFileNumber1':dataview.getUint8(38, true),    // Fn0 ':': Fn1 ':': Fn2.
      'nMagicNumber1':dataview.getUint8(39, true),    // Always 0xFA.

      // Target data.
      'nTargetTimeBelow':dataview.getUint16(40, true),        // Time below min. In seconds.
      'nTargetTimeIn':dataview.getUint16(42, true),            // Time within min and max. In seconds.
      'nTargetTimeAbove':dataview.getUint16(44, true),        // Time above max. In seconds.
      'nTargetSpeedMin':dataview.getUint16(46, true),        // If target is Speed, in decameters/h. / If target is Pace, in seconds.
      'nTargetSpeedMax':dataview.getUint16(48, true),        // If target is Speed, in decameters/h. / If target is Pace, in seconds.
      'nTargetHeartRateMin':dataview.getUint8(50, true),    // When target is HR, in bpm.
      'nTargetHeartRateMax':dataview.getUint8(51, true),    // When target is HR, in bpm.
      'nTargetMode':dataview.getUint8(52, true),            // 0 ': Not set, 1 ': Speed, 2 ': HR, 3 ': Pace.

      'pReserved1':[dataview.getUint8(53, true),dataview.getUint8(54, true),dataview.getUint8(55, true),dataview.getUint8(56, true),dataview.getUint8(57, true)],//[5]

      'nFileNumber2':dataview.getUint8(58, true),    // Fn0 ':': Fn1 ':': Fn2.
      'nMagicNumber2':dataview.getUint8(59, true)    // Always 0xF0.
    };
  }
}

class OMDFile {
  constructor(data) {
    this.data = data;
    this.header = null;
    this.load();
  }
  
  load(data) {
    data = typeof data == 'object' && Array.isArray(data) ? data : this.data;
    this.data = data;
    let dataview = new DataView(data);
    let tmp_data = [];
    for (let i=0; i<data.byteLength; i+=20) {
      switch (dataview.getUint8(19+i, true))
      {
        case 0xF1:
          tmp_data.push(this.loadGPSRec(dataview, i));
          break;
        case 0xF2:
          tmp_data.push(this.loadCurveRec(dataview, i));
          break;
      }
    }
    this.data = tmp_data;
  }
  
  

  loadGPSRec(dataview, idx) {
    return {
      'nLatitude':dataview.getInt32(0+idx, true),    // to / by 1000000.
      'nLongitude':dataview.getInt32(4+idx, true),    // to / by 1000000.
      'nDistance':dataview.getUint32(8+idx, true),    // Distance ran from start, in meters.
      'nTime':dataview.getUint16(12+idx, true),      // Time from start, in seconds.

      'nGPSStatus':dataview.getUint8(14+idx, true),  // *** ??? Always 3 in my files. Number of satellites maybe? ***

      'pReserved0':[dataview.getUint8(15+idx, true),dataview.getUint8(16, true),dataview.getUint8(17, true),dataview.getUint8(18, true),],//[4];

      'nType':dataview.getUint8(19+idx, true)      // 0xF1: GPS record.
    };
  }

  loadCurveRec(dataview, idx) {
    return {
      'nTime':dataview.getUint16(0+idx, true),            // In seconds.
      'nSpeed':dataview.getUint16(2+idx, true),            // In decameters/h.
      'nKCal':dataview.getUint16(4+idx, true),
      'nHeartRate':dataview.getUint8(6+idx, true),        // In bpm.

      'nLap':dataview.getUint8(7+idx, true),        // *** ??? ***
      'nCad':dataview.getUint8(8+idx, true),        // *** Cadence ??? *** => ??? 0 without cardio belt, 2 with cardio belt. Except on last F2 record. ???

      'nType':dataview.getUint8(19+idx, true),            // Padding on first half, 0xF2 on second half.
    };
  }
}

class OMXParser {
  constructor(omh, omd) {
    this.init();
    if (omh) {
      this.addData(omh);
    }
    if (omd) {
      this.addData(omd);
    }
  }

  get valid() {
    return this.header && typeof this.header == 'object' && this.containspoints;
  }

  get containspoints() {
    return this.data && Array.isArray(this.data);
  }

  init() {
    this.header = null;
    this.data = null;
    this.points = [];
    this.start = new Date();
  }

  addData(data) {
    let ret = false;
    if (typeof data !== 'object' || typeof data.byteLength !== 'number') return;
    if (data.byteLength == 60) {
      const omhfile = new OMHFile(data);
      // magic numbers 0xFA / 0xF0
      if (omhfile.data.nMagicNumber1 == 0xFA && omhfile.data.nMagicNumber2 == 0xF0) {
        this.header = omhfile.data;
        ret = true;
      }
    }
    if (!ret && data.byteLength%20 === 0) {
      let dataview = new DataView(data);
      let tmp = 0, valid = true;
      for (let i=0; i<data.byteLength; i+=20) {
        tmp = dataview.getUint8(19+i, true);
        // types 0xF1(GPS_RECORD) / 0xF2 (CURVE_RECORD)
        if (tmp != 0xF1 && tmp != 0xF2) {
          valid = false;
          break;
        }
      }
      if (valid) {
        const omdfile = new OMDFile(data);
        this.data = omdfile.data;
        ret = true;
      }
    }
    if (ret) this.decode();
    return ret;
  }
  
  decode() {
    this.points = [];
    this.start = new Date();
    if (this.header && typeof this.header == 'object') {
      this.start = new Date(this.header.nYear+2000, this.header.nMonth, this.header.nDay, this.header.nHours, this.header.nMinutes, 0);
    }
    if (this.data && Array.isArray(this.data)) {
      this.points = this.data.filter(e => e.nType == 0xF1).map(e => ({
        'lat':e.nLatitude/1000000,
        'lon':e.nLongitude/1000000,
        'time':new Date(this.start.getTime() + e.nTime)
      }));
    }
  }

  toGPX() {
    let gpx = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
    gpx += "<gpx version=\"1.1\" creator=\"OMX2GPX\" xmlns=\"http://www.topografix.com/GPX/1/1\">\n";
    gpx += "\t<metadata>\n\t\t<author>\n\t\t\t<name>OMX2GPX</name>\n\t\t</author>\n\t</metadata>\n";
    gpx += "\t<trk>\n\t\t<trkseg>\n";
    for (let i=0; i<this.points.length; i++) {
      gpx += "\t\t<trkpt lat=\""+this.points[i].lat+"\" lon=\""+this.points[i].lon+"\">\n";
      gpx += "\t\t\t<time>"+this.points[i].time.toISOString()+"</time>\n";
      gpx += "\t\t</trkpt>\n";
    }
    gpx += "\t\t</trkseg>\n\t</trk>\n</gpx>\n";
    return gpx;
  }
}
