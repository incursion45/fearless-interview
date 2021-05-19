import * as core from 'express-serve-static-core';
import express from "express";
import * as http from "http";
import { Socket } from 'socket.io';

export namespace App {
    export class Application{
        app: core.Express;
        server: http.Server;


        constructor(private port:number){
            this.init();
        }

        private init(){
            this.app = express();
            this.server = http.createServer(this.app);
            this.app.use(express.static("wwwroot"));
        }

        run(){
            this.app.listen(this.port, () => {
                console.log(`listening on ${this.port}`);
            });
        }
    }
}
