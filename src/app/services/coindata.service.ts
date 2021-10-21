import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { CoinGeckoResponse } from '../models/cgresponse';
import { BscResponse } from '../models/bscresponse';
import { PancakeSwapResponse } from '../models/pcsresponse';

import { environment } from 'src/environments/environment';
@Injectable()
export class CoinDataService {
  private apiKey = environment.bscApiKey;
  private burnAddress = '0x000000000000000000000000000000000000dead';
  private contractAddress = '0x92a4ebee814afe58741d7f216dc10211d5abc250';
  private bscApiUrl = 'https://api.bscscan.com/api';
  private cgApiUrl = 'https://api.coingecko.com/api/v3';
  private pcsApiUrl = 'https://api.pancakeswap.info/api/v2';

  constructor(private http: HttpClient) {}

  getBscBurnData(): Observable<BscResponse> {
    return this.getBscWalletTokensHeld(this.burnAddress);
  }

  getBscWalletTokensHeld(walletAddress: string): Observable<BscResponse> {
    const mod = 'account';
    const action = 'tokenbalance';

    const url = `${this.bscApiUrl}?module=${mod}&action=${action}&contractaddress=${this.contractAddress}&address=${walletAddress}&apikey=${this.apiKey}`;

    return this.http
      .get(url)
      .pipe(map((data: any) => ({ result: data.result } as BscResponse)));
  }

  getPancakeTokenData(): Observable<PancakeSwapResponse> {
    const url = `${this.pcsApiUrl}/tokens/${this.contractAddress}`;
    //console.log(url);

    return this.http.get(url).pipe(
      map(
        (data: any) =>
          ({
            price: data.data.price,
          } as PancakeSwapResponse)
      )
    );
  }

  getCoinGeckoTokenData(): Observable<CoinGeckoResponse> {
    const currency = 'usd';
    const tokenApiId = 'erabbit';
    const url = `${this.cgApiUrl}/coins/markets?vs_currency=${currency}&ids=${tokenApiId}`;

    return this.http.get(url).pipe(
      map(
        (data) =>
          ({
            currentPrice: data[0].current_price,
            totalVolume: data[0].total_volume,
            circulatingSupply: data[0].circulating_supply,
            totalSupply: data[0].total_supply,
            maxSupply: data[0].max_supply,
          } as CoinGeckoResponse)
      )
    );
  }
}
