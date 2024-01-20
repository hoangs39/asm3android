// ==== awesomechat.js ====
const express = require('express');
const app = express();
// const server = require('http').createServer(app);
// const {Server} = require('socket.io');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())

// const io = new Server(server);
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
    console.log("Server's Listening on Port 8888")
});


// app.get("/", (req,res) => {
//     res.send("<></>");
// })
const connection_string = "mongodb+srv://hoang:hoang@cluster0.cinin9p.mongodb.net/UserDB?retryWrites=true&w=majority"
mongoose.set('strictQuery', false);
mongoose
    .connect(connection_string, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("DB Connection Successful!"))
    .catch((err) => {
        console.log(err);
});


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    name: {
        type: String,

    },
    role: {
        type: String,
    },
    password: {
        type: String,
        default: "",
    },
    description: {
        type: String,
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Non-binary"],
        default: "Non-binary",
    },
    avatarImg: {
        data: Buffer,
        contentType: String,
    },
    status: {
        type: String,
        enum: ["normal", "premium"],
        default: "normal",
    },
    latitude: {
        type: String,
        default: "0.0000",
    },
    longitude : {
        type: String,
        default: "0.0000",
    },
    age: {
        type: String,
    },
})

const users = new mongoose.model('User', userSchema, 'Users') // name - schema - collection

const preferenceSchema = new mongoose.Schema({
    age: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    partner: {
        type: String,
        enum: ["Male", "Female", "Surprise me"],
        default: "Surprise me",
    },
    interest: {
        type: String,
    },
    program: {
        type: String,
    },
})

const preferences = new mongoose.model('Preference', preferenceSchema, 'Preferences') // name - schema - collection


const matchSchema = new mongoose.Schema({
    participants: [
        {
            type: String,
        },
    ],
    status: [
        {
            type: String,
        },
    ],
    conversation: [
        {
            sender: {
                type: String,
            },
            message: String,
        },
    ],
});

const matches = new mongoose.model('Match', matchSchema, 'Matches') // name - schema - collection


// 1. Register: register || email, name, description, image, longitude, latitude, gender, partner, program, interest, password, status, role, age;
// done
const upload = multer();
// router.post("/register/", upload.single("image"), async (req, res) => {
//     console.log(req.file);
// // Create a new user with image upload
// const newUser = new User({
//     phone: req.body.phone,
//     name: req.body.name,
//     email: req.body.email,
//     password: await bcrypt.hash(req.body.password, 10),
//     avatarImg: {
//         data: req.file.buffer,
//         contentType: req.file.mimetype,
//     },
// });

// await newUser.save();
// console.log(newUser);


//MULTER FOR GETTING IMAGE;
// ONLY TAKE THE BUFFER OF THE IMAGE;
app.post('/register', upload.single("image"), async (req, res) => {
    try {
        const name = req.body.userName;
        const role = req.body.role;
        const password = req.body.password;
        const email = req.body.email;
        const description = req.body.description;
        const longitude = req.body.longitude;
        const latitude = req.body.latitude;
        const gender = req.body.gender;
        const partner = req.body.partner;
        const program = req.body.program;
        const interest = req.body.interest;
        const status = req.body.status;
        const age = req.body.age;
        const phone = req.body.phone;

        console.log(role + name + password + req.body.userName);
        const user = await new users({
            email,
            phone,
            name,
            role,
            password,
            description,
            gender,
            avatarImg: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            status,
            latitude,
            longitude,
            age,
        })
        console.log({
            email,
            phone,
            role,
            password,
            description,
            gender,
            avatarImg: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            status,
            latitude,
            longitude,
            age,
            name,
        })
        await user.save();
        const preference = await new preferences({
            email,
            age,
            partner,
            interest,
            program,
        })
        await preference.save();
        return res.status(200).send();
    } catch (error) {
        console.log(error);
    }
})

// 2. Login: Gmail => only get email || email -> check account by email? || check by password, name;
//done
app.post("/authentication", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email + password);
        const user = await users.findOne({ email, password });
        
        if (user != null) {
            // console.log(user);
            res.status(200).send(user);
        } else {
            res.status(404).send("Not Allowed!");
        }
    } catch (error) {
        console.log(error);
    }
});

//done
// SEARCH ACCOUNT BY THEIR EMAILS
app.post("/authenticationemail", async (req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const user = await users.findOne({email});
        if (user != null) {
            res.status(200).send(user);
        } else {
            res.status(404).send("Not Allowed!");
        }
    } catch (error) {
        console.log(error);
    }
});

// 3. Profile: => image, name, age, interest, program
//done
// SEARCH USER, PREFERENCES BY THEIR EMAILS
app.post("/getProfile", async (req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const user = await users.findOne({ email});
        const preference = await preferences.findOne({ email });

        if (user != null) {
            res.status(200).send({user: user, preference: preference});
            console.log({user: user, preference: preference});
        } else {
            res.status(404).send("Not Allowed!");
        }
    } catch (error) {
        console.log(error);
    }
});


//done
// UPDATE THE PROFILE [USER, PREFERNCES] FOR USER
app.post('/updateUserProfile', async (req, res) => {
    try {
        const email = req.body.email;
        const phone = req.body.phone;
        const name = req.body.name;
        const description = req.body.description;
        const gender = req.body.gender;

        const program = req.body.program;
        const interest = req.body.interest;
        const age = req.body.age;
        const partner = req.body.partner;

        // const found_user = users.findOne({ name: userName });
        // UPDATE USER'S PERSONAL INFROMATION
        const updated_user = await users.findOneAndUpdate({ email }, {
            phone,
            name,
            description,
            gender,
            age,
        }, {new: false},);
        // UPDATE USER'S PREFERENCES BY SEARCH THIER EMAIL
        const updated_preference = await preferences.findOneAndUpdate(
        {email}, 
        {
            program,
            interest,
            age,
            partner,
        }, 
        {
            new: false,
        })
        if (updated_user != null) {
            return res.status(200).json({ message: 'Updated Completely' });
        } else {
            res.status(500).send("Failed To Update!")
        }

    } catch (error) {
        console.log(error);
    }
})
// 4. Home: 
// get current location
//done
//UPDATE LONGITUDE AND LATITUDE
app.post('/updateUserLocation', async (req, res) => {
    try {
        const { email, latitude, longitude } = req.body;

        const updated_user = await users.findOneAndUpdate(
            { email },
            { latitude, longitude },
            { new: true } // Return the modified document
        );

        if (updated_user !== null) {
            res.status(200).send("Updated Successfully");
        } else {
            res.status(500).send("Failed To Update!");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// list of Mates: "filtered by the location, preferences, "
// {email, name, description, image, longitude, latitude, gender, partner, program, interest, status, role, age;}
//done
// FIND MATES BY SEARCH THEIR PREFERNCES, THEN LOOK UP FOR ALL PREFERENCES THAT SHARE THE SAME INTERESTS, 
// THEN USE THE EMAIL ATTRIBUTE INSIDE THE ACCOUNT TO FIND USER AND PUSH INTO AN ARRAY FOR RESULTS AS WELL AS CREATING
// MATCHES WITH AN EMPTY STRING STATUS ARRAY, SO WHEN ONE SWIPE RIGHT, I PUSH AN "OK" STATUS STRING INTO THEM;
// ALERT: THE MATCHES BETWEEN 2 PEOPLE ONLY CREATED ONCE
app.post('/findMates', async (req, res) => {
    try {
        const email = req.body.email;
        // const email = req.params.email;
        const user = await users.findOne({ email });
        const found_preference = await preferences.findOne({email});

        if (found_preference != null) {

            const matched_partner = found_preference.partner;
            const matched_program = found_preference.program;
            const matched_interest = found_preference.interest;

            const mates = [];

            const arrayIds = await preferences.find({ program: matched_program, interest: matched_interest });
            if (arrayIds.length != 0) {
                // Use Promise.all to wait for all async operations to complete
                Promise.all(
                arrayIds.map(async (m) => {
                    const mate = await users.findOne({email : m.email});
                    if (((parseFloat(mate.longitude) - parseFloat(user.longitude)) < 0.8) && ((parseFloat(mate.latitude) - parseFloat(user.latitude)) < 0.8))
                    {
                            
                        if((mate.gender === matched_partner) && (mate.email !== user.email)){
                            
                            const foundMatches = await matches.findOne({
                                $and: [
                                    { "participants": { $elemMatch: { $eq: email } } },
                                    { "participants": { $elemMatch: { $eq: m.email } } }
                                ]
                            });
                            if (foundMatches == null) {
                            mates.push(mate)
                            const match = new matches({
                                participants: [email, m.email],
                                status: [],
                                conversation: [],
                            });
                            await match.save();
                            }else{
                                if (foundMatches.status[0] === email || foundMatches.status[1] === email || foundMatches.status.length == 2){
                                }else{
                                    mates.push(mate)
                                }
                            }
                            // console.log(foundMatches);
                            
                        }
                    }
                })).then(
                    () => {
                        res.status(200).send(mates);
                        // console.log(email);
                    }
                )
            }
            else{
                res.status(404).send("Not Found!");
            }
        } else {
            res.status(404).send("Not Found!");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});
//done
// FIND ALL MATCHES THAT HAVE PARTICIPANTS CONTAINING USER'S EMAIL, THEN CHECK THE STATUS ARRAY LENGTH.
// IF THE LENGTH EQUAL TO 2, PUSH IT INTO TH ARRAY AND RETURN BACK
app.get('/findMatches/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const foundMatches = await matches.find({ participants: { $elemMatch: { $eq: email } } });
        console.log(foundMatches);
        if (foundMatches != null) {
            const realMatches = [];
            foundMatches.map(m => {
                if(m.status.length == 2){
                    realMatches.push(m)
                }
            })
            res.status(200).send(realMatches);
        } else {
            res.status(404).send("Not Found!");
        }
    } catch (error) {
        console.log(error);
    }
});

app.post('/lookMatches', async (req, res) => {
    try {
        const email = req.body.email;
        const foundMatches = await matches.find({ participants: { $elemMatch: { $eq: email } } });
        console.log(foundMatches);
        if (foundMatches != null) {
            const realMatches = [];
            foundMatches.map(m => {
                if (m.status.length == 2) {
                    if(m.status[0] !== email){
                        realMatches.push(m.status[0]);
                    } else if (m.status[1] !== email){
                        realMatches.push(m.status[1]);
                    }
                    // realMatches.pop();
                }

            })
            res.status(200).send(realMatches);
        } else {
            res.status(404).send("Not Found!");
        }
    } catch (error) {
        console.log(error);
    }
});


app.get('/findMatch', async (req, res) => {
    try {
        const oemail = req.params.oemail;
        const email = req.params.email;
        const foundMatches = await matches.findOne({ participants: { $elemMatch: { $eq: email, $eq: oemail } } });
        if (foundMatches != null) {
            res.status(200).send(foundMatches);
        } else {
            res.status(404).send("Not Found!");
        }
    } catch (error) {
        console.log(error);
    }
});

//done
//SEARCH FOR MATCH THAT CONTAIN BOTH EMAIL OF MATE AND USER THEN PUSH "OK" STATUS INTO THE STATUS ARRAY ATTRIBUTE
// IF ITS LENGTH IS SMALLER THAN 2.
app.post('/matches', async (req, res) => {
    try {
        const oemail = req.body.oemail;
        const email = req.body.email;
        const foundMatches = await matches.findOne({
            $and: [
                { "participants": { $elemMatch: { $eq: email } } },
                { "participants": { $elemMatch: { $eq: oemail } } }
            ]
        });
        if (foundMatches != null) {
            if (foundMatches.status.length < 2 && !foundMatches.status.includes(email)){
                const newStatus= [...foundMatches.status];
                newStatus.push(email);
                const updated_match = await matches.findOneAndUpdate({
                    $and: [
                        { "participants": { $elemMatch: { $eq: email } } },
                        { "participants": { $elemMatch: { $eq: oemail } } }
                    ]
                },
                {
                    status: newStatus,
                }, 
                { new: false },
                );
                // const updated_match = await matches.findOneAndUpdate({ participants: { $elemMatch: { $eq: oemail, $eq: email } } }, {
                //     status: newStatus,
                // }, { new: false },);
                return res.status(200).json({ message: 'Updated Completely' });
            }else{
                return res.status(200).json({ message: 'Match!' });
            }
        } else {
            res.status(404).send("Not Found!");
        }
    } catch (error) {
        console.log(error);
    }
});

// 5. subscription: 
// {payment: }

// 6. admin: 
// {users, payment}
//done
// RETURN ALL USERS
app.get('/users', async (req, res) => {
    try {
        const found_users = await users.find();
        if (found_users != null) {
            res.status(200).send(found_users);
        } else {
            res.status(404).send("Not Found!")
        }
    } catch (error) {
        console.log(error);
    }
});

// DELETE AN USER BY THEIR EMAIL
app.delete('/deleteUser/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const delete_user = await users.findOneAndDelete({
            email
        });

        if (delete_user != null) {

            res.status(200).send("Delete Completely")
        } else {
            res.status(500).send("Failed To Delete!")
        }
    } catch (error) {
        console.log(error);
    }
})

//done
// CHANGE USER'S STATUS FOR PREMIUM FEATURES "IN PROGRESS"
app.put('/changeStatus/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const status = req.body.status;
        // const found_user = users.findOne({ name: userName });
        const updated_user = await users.findOneAndUpdate({ email }, {
            status
        }, {new: false},);
        if (updated_user != null) {
            res.status(200).send("Updated Completely")
        } else {
            res.status(500).send("Failed To Update!")
        }

    } catch (error) {
        console.log(error);
    }
})
// 7. Chat:
// {sockets => to chat individual || list of Matches}
//done
// FIND USER BY THEIR NAME
app.get('/findMate/:name', async (req, res) => {
    try {
        const found_user = await users.findOne({ name: req.params.name });
        if (found_user != null) {
            res.status(200).send(found_user);
        } else {
            res.status(404).send([]);
        }

    } catch (error) {
        console.log(error);
    }
});

// UI:
// => Fixing the UI and more on layout, check the page transition
// 1. Click => mates Profiles + display the left or right direction + the empty notification
// 2. List of Mates
// 3. Chat Pages
// 4. Register -> Home && Profile Creation || Login
// 5. 

// const queueMatch = [];

// CHATTING FEATURE
// SOCKET CONNECT WHEN USER GO TO HOME ACTIVITY
// io.on("connect", (socket) => {
//     console.log("User connected:", socket.id);

//     // socket.on('message', (ms) => {
//     //     io.emit('message', ms)
//     // })

//     // WHEN THE USER CLICK ON ONE MATCH IN THE MATCHES LIST, THE FE WILL CALL THE JOINMATCHROOM
//     // AND THE SERVER LISTEN TO MAKE THE SOCKET JOIN A SPECIFIC ROOM.
//     socket.on("joinMatchRoom", (roomMatchId) => {
//         console.log("joined " + roomMatchId);
//         socket.join(roomMatchId);
//     });

//     // WHEN THE USER SEND THE MESSAGE THE FE EMIT THE EVENT OF SENDMESSAGE TO SEND MESSAGE DATA AND MATCHID
//     socket.on("sendMessage", async (data) => {
//         console.log(data);
//         try {
//             const matchId = data.matchId;
//             const match = await matches.findById(matchId);

//             if (match) {
//                 const { sender, message } = data;
//                 // STORE DATA TO MATCH IN DB
//                 match.conversation.push({ sender, message });
//                 await match.save();
//                 // THEN EMIT THE CONTENT OF SENT DATA TO DISPLAY BACK ON FE VIA THE EVENT OF MESSAGERECEIVED
//                 io.to(matchId).emit("messageReceived", { sender, message });
//             }
//         } catch (error) {
//             console.error("Error sending message:", error.message);
//         }
//     });

//     // socket.on("connectToQueue", () => {
//     //     queueMatch.push({ socket });
//     //     if (queueMatch.length >= 2) {
//     //         const user1 = queueMatch.shift();
//     //         const user2 = queueMatch.shift();

//     //         const match = new Match({
//     //             participants: [user1.socket.id, user2.socket.id],
//     //             status: "available",
//     //             conversation: [],
//     //         });

//     //         match.save((err) => {
//     //             if (err) {
//     //                 console.error("Error creating match:", err);
//     //             } else {
//     //                 io.to(user1.socket.id).emit("matchFound", { matchId: match._id });
//     //                 io.to(user2.socket.id).emit("matchFound", { matchId: match._id });

//     //                 // Join private chat room
//     //                 io.in(match._id).socketsJoin(match._id);
//     //             }
//     //         });
//     //     }
//     // });

//     // WHEN THE USER ESCAPE OUT OF THE CHAT WITH OTHER USER, IT CALLS DISCONNECT TO LEFT THE ROOM THAT USER'S SOCKET
//     // HAS JOINED IN THE SECOND STEP.
//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//         // const index = queueMatch.findIndex((entry) => entry.socket === socket);
//         // if (index !== -1) {
//         //     queueMatch.splice(index, 1);
//         // }

//         // Leave private chat room on disconnect
//         const rooms = io.sockets.adapter.rooms;
//         for (const roomId in rooms) {
//             if (rooms[roomId].sockets[socket.id]) {
//                 socket.leave(roomId);
//             }
//         }
//     });
// })





