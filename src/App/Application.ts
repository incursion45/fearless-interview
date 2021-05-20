import * as core from 'express-serve-static-core';
import express from "express";
import * as http from "http";
import { Socket } from 'socket.io';
import {Player} from "./Models/Players"
import { v4 as uuidv4 } from 'uuid';
import { Leaderboard } from './Models/Leaderboard';
import fetch from 'node-fetch';

export namespace App {
    export class Application {
        app: core.Express;
        server: http.Server;
        io: SocketIO.Server;

        players:Array<Player> = [];
        leaderboard: Array<Leaderboard> = [];

        constructor(private port: number, private key:string) {

        }


        //start the program
        run() {
            this.app = express(); //setting up webserver
            this.server = http.createServer(this.app);
            this.io = require('socket.io')(this.server);
            this.app.use(express.static("wwwroot"));

            //setting up sockets
            this.initSockets();
            
            this.setLeaderboardSync();
            this.server.listen(this.port, () => {
                console.log(`listening on http://localhost:${this.port}/`);
            })
        }

        private initSockets() {
            console.log("wiring up sockets");

            //when player connect to game
            this.io.on('connect', (socket) => {
                
                // getting player settings
                let query = socket.handshake.query;
                
                let player: Player = {
                    name:query.name,
                    icon:query.icon,
                    color:query.color,
                    sessionId: uuidv4(),  // set uuid so we can id that player
                    socketId : socket.id
                };

                //adding player game roster
                this.players.push(player);
                
                //sending to all clients that new player in the room
                this.io.emit('connected', `player ${player.name} has enter`);

                //sending back player info to connected player
                this.io.to(socket.id).emit('set-player',{ playerCount: this.players.length, player:player });

                //setting on click event for player
                socket.on('button-click', (player : Player) => {
                    //call api for hit tracking
                    this.hitCounter(player.sessionId);
                });

                //removing the player when disconnect
                socket.on('disconnect', () => {
                    let player = this.players.filter((element) => {
                       return element.socketId == socket.id;
                    })[0];
                    
                    this.io.emit('disconnected', `${player.name} has left`);
                });

                //send leaderboard to all clients every 2 seconds
                setInterval(() => {
                    if(this.leaderboard.length > 0)
                        this.io.emit('leadboard-update', this.leaderboard)
                }, 2000)

            });
        }

        private async hitCounter(sessionId : string){
            try {
                //http call to api
                let response = await fetch(`https://api.countapi.xyz/hit/${sessionId}/${this.key}`);
                let data = await response.json();
               
                let p = this.players.filter(player => { return player.sessionId == sessionId })[0];

                //read out hit count
                console.log(`${p.name} count ${data.value}`)

            } catch (error) {
                console.log(error);
            }
        }

        private setLeaderboardSync(){
            //set update interval every 5 seconds
            setInterval(async () => {
                this.leaderboard = await this.getleaderboard();
            }, 5000)
        }

        private async getleaderboard() : Promise<Array<Leaderboard>>{
            let ary : Array<Leaderboard> = [];
            
            for await (const p of this.players) {
                //create item for arrry
                let index = ary.push({
                  player : p,
                  clickCount : 0    
                }) - 1;
                try {
                    //http call to api to get hits
                    let response = await fetch(`https://api.countapi.xyz/get/${p.sessionId}/${this.key}`);
                    let data = await response.json();
                    ary[index].clickCount = data.value
                } catch (error) {
                    console.log(error);
                }
            }

            return ary;
        }
    }
}


