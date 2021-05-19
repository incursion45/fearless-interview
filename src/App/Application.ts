import * as core from 'express-serve-static-core';
import express from "express";
import * as http from "http";
import { Socket } from 'socket.io';
import {Player} from "./Models/Players"


export namespace App {
    export class Application {
        app: core.Express;
        server: http.Server;
        io: SocketIO.Server;

        players:Array<Player> = [];

        constructor(private port: number) {

        }

        run() {
            this.app = express();
            this.server = http.createServer(this.app);
            this.io = require('socket.io')(this.server);
            this.app.use(express.static("wwwroot"));

            this.initSockets();

            this.server.listen(this.port, () => {
                console.log(`listening on http://localhost:${this.port}/`);
            })
        }

        private initSockets() {
            console.log("wiring up sockets");
            this.io.on('connect', (socket) => {
                let query = socket.handshake.query;
                
                let player: Player = {
                    name:query.name,
                    icon:query.icon,
                    color:query.color,
                    sessionId: socket.id
                };

                this.players.push(player);
                
                this.io.emit('connected', { playerCount: this.players.length, player:player });

                socket.on('disconnect', () => {
                    let index = this.players.findIndex((element) => {
                        element.sessionId == socket.id;
                    });

                    let player = this.players[index];
                    
                    this.io.emit('disconnected', { playerCount: this.players.length, player:player });
                });
            });
        }

    }
}
