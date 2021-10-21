import { Component, OnInit } from '@angular/core';

import { ERabbitData } from './erabbit.model';
import { CoinDataService } from '../services/coindata.service';
import { CoinGeckoResponse } from '../models/cgresponse';
import { BscResponse } from '../models/bscresponse';
import { PancakeSwapResponse } from '../models/pcsresponse';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  erabbitData: ERabbitData = {
    totalSupply: 1000000000,
    burnedTokens: 0,
    circulatingSupply: 1000000000,
    rewardPercent: 0.03,
    dailyVolume: 0,
    tokensHeld: 100000,
    tokenPrice: 0.00183317,
  };
  cgTokenResult: CoinGeckoResponse;
  pcsTokenResult: PancakeSwapResponse;
  bscBurnedResult: BscResponse;
  bscWalletTokensHeld: BscResponse;
  walletAddress: string;
  public rewards = 0;

  constructor(private coinDataService: CoinDataService) {}

  ngOnInit() {
    this.loadLocalStorage();
    this.getBscBurnData();
    this.getPancakeTokenPrice();
    this.getCoinGeckoTokenData();
  }

  getWalletAddressTokensHeld() {
    if (this.walletAddress !== '') {
      this.coinDataService
        .getBscWalletTokensHeld(this.walletAddress)
        .subscribe((data) => {
          this.bscWalletTokensHeld = data;
          const value = parseFloat(data.result);
          if (!isNaN(value)) {
            const decValue = value * 0.000000001;
            this.erabbitData.tokensHeld = decValue;
            this.saveLocalTokensHeld();
            this.calculateRewards();
          }
          //console.log(data);
        });
    }
  }

  getBscBurnData() {
    this.coinDataService.getBscBurnData().subscribe((data) => {
      this.bscBurnedResult = data;
      const value = parseFloat(data.result);
      if (!isNaN(value)) {
        const decValue = value * 0.000000001;
        this.erabbitData.burnedTokens = decValue;
        this.saveLocalTokensBurned();
        this.updateCirculatingSupply();
        this.calculateRewards();
      }
    });
  }

  getPancakeTokenPrice() {
    this.coinDataService.getPancakeTokenData().subscribe((data) => {
      this.pcsTokenResult = data;
      const value = parseFloat(data.price);
      if (!isNaN(value)) {
        this.erabbitData.tokenPrice = value;
        this.saveLocalTokenPrice();
        this.calculateRewards();
      }
    });
  }

  getCoinGeckoTokenData() {
    this.coinDataService.getCoinGeckoTokenData().subscribe((data) => {
      this.cgTokenResult = data;
      this.erabbitData.dailyVolume = this.cgTokenResult.totalVolume;
      this.saveLocalDailyVolume();
    });
  }

  loadLocalStorage() {
    this.loadLocalTokensBurned();
    this.loadLocalDailyVolume();
    this.loadLocalWalletAddress();
    this.loadLocalTokensHeld();
  }

  loadLocalTokensBurned() {
    const stringValue = localStorage.getItem('erabbit_tokensBurned');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.erabbitData.burnedTokens = value;
    }
  }

  loadLocalDailyVolume() {
    const stringValue = localStorage.getItem('erabbit_dailyVolume');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.erabbitData.dailyVolume = value;
    }
  }

  loadLocalTokenPrice() {
    const stringValue = localStorage.getItem('erabbit_tokensPrice');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.erabbitData.tokenPrice = value;
    }
  }

  loadLocalWalletAddress() {
    this.walletAddress = localStorage.getItem('erabbit_walletAddress');
  }

  loadLocalTokensHeld() {
    const stringValue = localStorage.getItem('erabbit_tokensHeld');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.erabbitData.tokensHeld = value;
    }
  }

  saveLocalDailyVolume() {
    localStorage.setItem(
      'erabbit_dailyVolume',
      this.erabbitData.dailyVolume.toString()
    );
  }

  saveLocalTokensBurned() {
    localStorage.setItem(
      'erabbit_tokensBurned',
      this.erabbitData.burnedTokens.toString()
    );
  }

  saveLocalTokenPrice() {
    localStorage.setItem(
      'erabbit_tokenPrice',
      this.erabbitData.tokenPrice.toString()
    );
  }

  saveLocalWalletAddress() {
    localStorage.setItem('erabbit_walletAddress', this.walletAddress);
  }

  saveLocalTokensHeld() {
    localStorage.setItem(
      'erabbit_tokensHeld',
      this.erabbitData.tokensHeld.toString()
    );
  }

  updateCirculatingSupply() {
    this.erabbitData.circulatingSupply =
      this.erabbitData.totalSupply - this.erabbitData.burnedTokens;
  }

  calculateRewards() {
    const totalDistribution = this.totalDistribution();
    const effectivePercentage = this.effectivePercentage();
    this.rewards = effectivePercentage * totalDistribution;
  }

  tokenRewards() {
    return this.rewards / this.erabbitData.tokenPrice;
  }

  totalDistribution() {
    return this.erabbitData.dailyVolume * this.erabbitData.rewardPercent;
  }

  effectivePercentage() {
    return this.erabbitData.tokensHeld / this.erabbitData.circulatingSupply;
  }

  // onChange Methods
  onChangeTokensBurned(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.burnedTokens = parsedValue;
      this.saveLocalTokensBurned();
      this.updateCirculatingSupply();
      this.calculateRewards();
    }
  }

  onChangeDailyVolume(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.dailyVolume = parsedValue;
      this.saveLocalDailyVolume();
      this.calculateRewards();
    }
  }

  onChangeTokensHeld(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.tokensHeld = parsedValue;
      this.saveLocalTokensHeld();
      this.calculateRewards();
    }
  }

  onChangeTokenPrice(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.tokenPrice = parsedValue;
      this.saveLocalTokenPrice();
      this.calculateRewards();
    }
  }

  onChangeWalletAddress(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    this.walletAddress = value;
    this.saveLocalWalletAddress();
  }
}
