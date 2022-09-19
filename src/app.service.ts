import { Injectable, OnModuleInit } from '@nestjs/common';
import Binance from 'binance-api-node';
const binanceConfig =  Binance({
  apiKey: process.env.BINANCE_API_KEY,
  apiSecret: process.env.BINANCE_SECRET
}) 
@Injectable()
export class AppService implements OnModuleInit{
  async onModuleInit() {
    this.openUserWs();
  }
  async openUserWs() {
    await binanceConfig.ws.user((data)=> {
      console.log(data)
    })
  }
}
