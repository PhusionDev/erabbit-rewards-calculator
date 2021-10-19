import { Component, OnInit } from '@angular/core';

import { ERabbitData } from './erabbit.model';
import { CoinDataService } from '../services/coindata.service';
import { ITokenData } from '../models/tokendata';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  erabbitData: ERabbitData = {
    totalSupply: 1000000000,
    burnedTokens: 480000000,
    circulatingSupply: 0,
    rewardPercent: 0.03,
    dailyVolume: 1000000,
    tokenHeld: 100000,
  };
  tokenData: ITokenData;

  public rewards = 0;

  constructor(private coinDataService: CoinDataService) {
    this.updateCirculatingSupply();
    this.calculateRewards();
  }

  ngOnInit() {
    this.loadLocalStorage();
    this.calculateRewards();
    //this.getTokenData();
  }

  getTokenData() {
    this.coinDataService.getCoinGeckoTokenData().subscribe((data) => {
      this.tokenData = data;
      this.erabbitData.dailyVolume = this.tokenData.totalVolume;
      this.saveLocalDailyVolume();
      //console.log(data);
    });
  }

  loadLocalStorage() {
    this.loadLocalTokensBurned();
    this.loadLocalDailyVolume();
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

  loadLocalTokensHeld() {
    const stringValue = localStorage.getItem('erabbit_tokensHeld');
    const value = parseFloat(stringValue);

    if (!isNaN(value)) {
      this.erabbitData.tokenHeld = value;
    }
  }

  saveLocalDailyVolume() {
    localStorage.setItem(
      'erabbit_dailyVolume',
      this.erabbitData.dailyVolume.toString()
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

  totalDistribution() {
    return this.erabbitData.dailyVolume * this.erabbitData.rewardPercent;
  }

  effectivePercentage() {
    return this.erabbitData.tokenHeld / this.erabbitData.circulatingSupply;
  }

  // onChange Methods
  onChangeTokensBurned(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.burnedTokens = parsedValue;
      this.updateCirculatingSupply();
      this.calculateRewards();

      // save to local storage
      localStorage.setItem(
        'erabbit_tokensBurned',
        this.erabbitData.burnedTokens.toString()
      );
    }
  }

  onChangeDailyVolume(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.dailyVolume = parsedValue;
      this.calculateRewards();

      // save to local storage
      this.saveLocalDailyVolume();
    }
  }

  onChangeEgcHeld(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsedValue = parseFloat(value);

    if (!isNaN(parsedValue)) {
      this.erabbitData.tokenHeld = parsedValue;
      this.calculateRewards();

      // save to local storage
      localStorage.setItem(
        'erabbit_tokensHeld',
        this.erabbitData.tokenHeld.toString()
      );
    }
  }
}
