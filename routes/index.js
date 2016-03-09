
/*
 * GET home page.
 */

var mongoose = require('mongoose');
var AppInfo = mongoose.model('AppInfo');

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
new AppInfo({
    "gcm_id" : "52dfe0c469631792dba51770",
    "push_dates" : [ 
        new Date("2016-03-01T14:56:59.301Z"), 
        new Date("2016-03-05T14:56:59.301Z"), 
        new Date("2016-03-15T14:56:59.301Z"), 
        new Date("2016-03-25T14:56:59.301Z")
    ],
    "push_acks" : [ 
        new Date("2016-03-06T14:56:59.301Z"), 
        new Date("2016-03-17T14:56:59.301Z")
    ],
    "service_dates" : [ 
        new Date("2016-03-08T14:56:59.301Z")
    ]
}).save();
*/

exports.search = function ( key, check_dates ) {

  console.log('---------');
  var len = check_dates.length;
  var key = key;
  var imin = 0;
  var imax = len-1;
  var temp_l = null;
  var temp_h = null;

  while(imin<=imax)
  {
      var imid = Math.floor((imin+imax)/2);
      if (check_dates[imid] == key)
      {
          return {
              low:key, 
              high:key
          };
      }
      else if (check_dates[imid] < key)
      {
          temp_l = check_dates[imid];
          console.log(imid, temp_l);
          imin = imid + 1;
      }
      else
      {
          temp_h = check_dates[imid];
          console.log(imid, temp_h);
          imax = imid - 1;
      }
  }
  return {
      low:temp_l, 
      high:temp_h
  };
};

exports.predict = function ( req, res ) {
  //var db = req.db;
  //var AppInfo = db.get('AppInfo');  
  var gcm_id = req.param('id');
  var date_l = new Date(req.param('start_date'));
  var date_h = new Date(req.param('end_date'));

  AppInfo.findOne({ gcm_id: gcm_id }, function(err, docs) {
      var push_dates = docs.push_dates;
      var push_acks = docs.push_acks;
      var service_dates = docs.service_dates;

      var ack_l = exports.search(date_l, push_acks);
      var ack_h = exports.search(date_h, push_acks);

      var service_l = exports.search(date_l, service_dates);
      var service_h = exports.search(date_h, service_dates);

      var push_l = exports.search(date_l, push_dates);
      var push_h = exports.search(date_h, push_dates);

      var maxDate = date_h;

    
      console.log('ack_l', ack_l);
      console.log('ack_h', ack_h);
      console.log('service_l', service_l);
      console.log('service_h', service_h);
      console.log('push_l', push_l);
      console.log('push_h', push_h);

      if (ack_h.high >= date_h || service_h.high >= date_h)
      {
          // installed
          res.json({message:'Installed'});
      }
      else if (ack_l.high >= date_l || service_l.high >= date_l)
      {
          dates = [service_l.high, ack_l.high, service_h.low, ack_h.low];
          maxDate = new Date(Math.max.apply(null, dates));
      }

      if (push_dates[push_dates.length-1] > date_h)
      {
          // possible uninstall b/w maxDate and date_h
          res.json({message:'Possible uninstall between '+maxDate+' and '+date_h});
      }
      else
      {
          // installed
          res.json({message:'Installed'});
      }
  });
};

