
/*
 * GET home page.
 */

//var mongoose = require('mongoose');
//var AppInfo = mongoose.model('AppInfo');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var db;

MongoClient.connect('mongodb://localhost:27017/express-predict', function(err, database) {  
db=database;  
});

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.search = function ( key, check_dates ) {

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
          imin = imid + 1;
      }
      else
      {
          temp_h = check_dates[imid];
          imax = imid - 1;
      }
  }
  return {
      low:temp_l, 
      high:temp_h
  };
};

exports.predict = function ( req, res ) {
  
  var gcm_id = req.param('id');
  var date_l = new Date(req.param('start_date'));
  var date_h = new Date(req.param('end_date'));

  db.collection('AppInfo').findOne({ gcm_id: gcm_id }, function(err, docs) {
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

      /* Searched most recent events around the interval (in case it
       * is required later for analysis)
       * Can also use latest update for the same
       */

      if (ack_h.high >= date_h || service_h.high >= date_h)
      {
          res.json({message:'Installed'});
      }
      else if (ack_l.high >= date_l || service_l.high >= date_l)
      {
          dates = [service_l.high, ack_l.high, service_h.low, ack_h.low];
          maxDate = new Date(Math.max.apply(null, dates));
      }

      if (push_dates[push_dates.length-1] > date_h)
      {
          res.json({message:'Possible uninstall between '+maxDate+' and '+date_h});
      }
      else
      {
          res.json({message:'Installed'});
      }
  });
};

