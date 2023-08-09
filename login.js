
const express = require("express");
const bodyParser = require("body-parser");
const encoded = bodyParser.urlencoded();
const cookieParser = require("cookie-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const helmet = require("helmet");

dotenv.config({ path: './.env' });

const connection = require("./connection");




const app = express();
app.use("/assets",express.static("assets"));


app.set('view-engie', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(express.json()  );

// app.use(session({
//     secret: "secret",
//     resave: true,
//     saveUninitialized: true
// }));

// connect to database
connection.connect(function(error){
    if(error) throw error
    else console.log("Connected to database sucessfully!")

});


app.get("/", (req, res) => {
    // check if user is logged in, by checking cookie
    let username = req.cookies.username;
    let UserID = req.cookies.UserID;
  
    // render the home page
    return res.render("home.ejs", {
      username,UserID,
    });
});


app.get("/login",function(req,res){

    let bad_aut = req.query.msg ? true : false;

    if (bad_aut) {
        return res.render("index.ejs", {
            error: "Invalid username or password",
        });
    } else {
        return res.render("index.ejs");
    }
})




app.post("/", encoded, function(req, res) {
    var Email = req.body.Email;
    var Password = req.body.Password;
    var sql = "SELECT * FROM user WHERE Email = ? AND Password = ?"
    connection.query(sql, [Email,Password], function(error, results, fields) {
        if (Email == "admin@gmail.com" && Password == "admin") {
            res.redirect("/admin");
        } else if (results.length > 0) {
            res.cookie("username", Email,);
            res.cookie("UserID", results[0].UserID);
            return res.redirect("/main")
            
        }
        else {
            return res.redirect("/login?msg=fail");    
        }

    });
});



app.get("/register",function(req,res){
    let bad_aut = req.query.msg ? true : false;

    if (bad_aut) {
        return res.render("register.ejs", {
            error: "User already exists!",
        });
    } else {
        return res.render("register.ejs");
    }
})
app.post("/register",encoded, function(req,res){
    var Name = req.body.Name;
    var Email = req.body.Email;
    var Password = req.body.Password;
    var Phone = req.body.Phone;

    connection.query("SELECT * FROM basketball.user where Email=?",[Email],function(error,results,fields){
        if(error) console.log(error)
        else if (results.length > 0) {
            return res.redirect("/register?msg=fail");   
        } else (connection.query("insert into user(Name,Email,Password,Phone) values(?,?,?,?)",[Name,Email,Password,Phone],function(error,results,fields){
            if(error) console.log(error)
            res.render("index.ejs", {message: "Registration sucessful!"})
        }))

    })
})


// when login is sucess
app.get("/admin",function(req,res){
    connection.connect(function(error){
        if(error) console.log(error)

        connection.query("SELECT * FROM basketball.booking", function(error,results,fields){
            if(error) console.log(error)
            res.render("admin.ejs" , {show: results,})
        })
    })
})

    // connection.connect(function(error){
    //     if(error) console.log(error)

    //     var sql = "SELECT * FROM loginuser"
    
        // connection.query(sql, function (err, result) {
        //     if (err) console.log(err);
        //     res.render(__dirname+"/views/welcome.ejs", {show: result})
        //     //res.render("welcome.ejs" , {timetable: result})
 
//     connection.query("SELECT * from timetable where id ", function(error,results,fields){
//         if (results.length > 0) {
//             res.redirect("/welcome");
            
//         } else {
//             res.redirect("/");
            
            
//         }
//         res.end();

// app.post("/admin",encoded, function(req,res){
//     connection.connect(function(error){
//         if(error) console.log(error)
//         var sql = "SELECT * FROM loginuser"
//         connection.query(sql, function (err, result) {
//             if (err) console.log(err);
//             res.render("admin.ejs", {show: result})
//         })
//     })
// })



app.get("/delete", function(req,res){
    
    connection.connect(function(error){
        if(error) console.log(error)
        var sql = 'Delete from booking where BookingID=? '
        var BookingID = req.query.id;
        connection.query(sql,[BookingID],function(error,results,fields){
            if(error) console.log(error)
            res.redirect("/admin")
        })
    })
})


app.get("/welcome",encoded, function(req,res){
    const username = req.cookies.username;

    connection.query("SELECT * from timetable", function(error,results,fields){
    if(error) console.log(error)
    res.cookie("username",username)
    res.render("welcome.ejs" , {timetable: results,username,})
})
})

app.post("/welcome",encoded, function(req,res){
    var available_time = req.body.available_time;
    var court_type = req.body.court_type;
    var court_location = req.body.court_location;

    connection.query("insert into timetable(court_type,court_location,available_time) values(?,?,?) ",[court_type,court_location,available_time], function(error,results,fields){
        if(error) console.log(error)
        res.redirect("/welcome")
    })
})

app.get("/update",function(req,res){
    connection.connect(function(error){
        if(error) console.log(error)
        var sql = "SELECT * FROM booking WHERE BookingID = ?"
        var BookingID = req.query.BookingID;

        connection.query(sql,[BookingID],function(error,results,fields){
            if(error) console.log(error)
            res.render("update.ejs" , {show: results})
        })
    })
})

app.post("/update",encoded, function(req,res){
    connection.connect(function(error){
        if(error) console.log(error)
        
        var sql = "UPDATE booking SET Date = ?,Timming = ?, Status = ?, Payment = ? WHERE BookingId = ?"
        var BookingID = req.body.BookingID;
        var Date = req.body.Date;
        var Timming = req.body.Timming;
        var status = req.body.status;
        var Payment = req.body.Payment;
        
        connection.query(sql,[Date,Timming,status,Payment,BookingID],function(error,results,fields){ 
            if(error) console.log(error)
            res.redirect("/admin")
        })
    })
})




app.get("/main" , function(req,res){
    
    let bad_aut = req.query.msg ? true : false;
    var UserID = req.cookies.UserID;
    var username = req.cookies.username;
    
    connection.query("select * from booking order by Date asc;", function(error,results,fields){
        if(error) console.log(error)
        if (bad_aut) {
            return res.render("main.ejs" , {timetable:results,username,UserID,error: "Booking failed!",})  
        } else {
            return res.render("main.ejs" , {timetable:results,username,UserID,})  
        }
    })
})

app.post("/main",encoded, function(req,res){
    var Date = req.body.Date;
    var Timming = req.body.Timming;
    var status = req.body.status;
    var UserID = req.cookies.UserID;

    connection.query("SELECT * FROM basketball.booking where status=? and Date=? and Timming=?",[status,Date,Timming],function(error,results,fields){
        if(error) console.log(error)
        if (results.length > 0) {
            return res.redirect("/main?msg=fail");
        } else(connection.query("insert into booking(Date,Timming,status,UserID) values(?,?,?,?) ",[Date,Timming,status,UserID], function(error,results,fields){
            if(error) console.log(error)
            res.redirect("/main")
        }))
    })
})
        

    // connection.query("insert into booking(Date,Timming,status,UserID) values(?,?,?,?) ",[Date,Timming,status,UserID], function(error,results,fields){
    //     if(error) console.log(error)
    //     console.log(results)
    //     res.redirect("/main")
    // })
    // connection.query("SELECT * FROM basketball.user where Email=?",[Email],function(error,results,fields){
    //     if(error) console.log(error)
    //     else if (results.length > 0) {
    //         return res.redirect("/register?msg=fail");   
    //     } else (connection.query("insert into user(Name,Email,Password,Phone) values(?,?,?,?)",[Name,Email,Password,Phone],function(error,results,fields){
    //         if(error) console.log(error)
    //         res.render("index.ejs", {message: "Registration sucessful!"})
    //     }))

    // })



app.get("/about",function(req,res){
    res.render("about.ejs");
})

app.get("/contact",function(req,res){
    var Review = req.body.Review;
    var sql = "SELECT * FROM court"
    connection.query(sql,[Review],function(error,results,fields){
        if(error) console.log(error)
        return res.render("contact.ejs" , {show: results})
    })
})

app.post("/contact",encoded, function(req,res){
    var Review = req.body.Review;
    var sql = "Insert into court(Review) values(?)"
    connection.query(sql,[Review],function(error,results,fields){
        if(error) console.log(error)
        res.redirect("/contact")
    })
})


app.get("/logout",function(req,res){
    res.clearCookie("username");
    res.redirect("/");
})

app.get("/new",function(req,res){
    connection.query("SELECT * FROM nodejs.new_table", function(error,results,fields){
        if(error) console.log(error)
        res.render("new.ejs" , {show: results})
    })
})

app.post("/new",encoded, function(req,res){
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var value3 = req.body.value3;

    connection.query("insert into new_table(start_time,end_time,value3) values(?,?,?) ",[start_time,end_time,value3], function(error,results,fields){
        if(error) console.log(error)
        res.redirect("/new")
    })
})


//set app port
app.listen(3300, () => {
    console.log(`Serving on port 3300`)
})