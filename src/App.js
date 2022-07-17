import logo from './logo.svg';
import Emoji from './components/Emoji';
import './App.css';
import axios from 'axios';
import {Button, Card} from "react-bootstrap";
import React, { useState } from 'react';

const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR', 'MYR', 'RON',]
const currency_info = {'USD': ['🇺🇸', 'United States Dollar'], 
                 'EUR': ['🇪🇺', 'Euro'], 
                 'JPY': ['🇯🇵', 'Japanese Yen'], 
                 'GBP': ['🇬🇧', 'Pound Sterling'], 
                 'AUD': ['🇦🇺', 'Australian Dollar'], 
                 'CAD': ['🇨🇦', 'Canadian Dollar'], 
                 'CHF': ['🇨🇭', 'Swiss Franc'], 
                 'CNY': ['🇨🇳', 'Chinese Yuan'], 
                 'HKD': ['🇭🇰', 'Hong Kong Dollar'], 
                 'NZD': ['🇳🇿', 'New Zealand Dollar'], 
                 'SEK': ['🇸🇪', 'Swedish Krona'], 
                 'KRW': ['🇰🇷', 'South Korean Won'], 
                 'SGD': ['🇸🇬', 'Singapore Dollar'], 
                 'NOK': ['🇳🇴', 'Norwegian Krone'], 
                 'MXN': ['🇲🇽', 'Mexican Peso'], 
                 'INR': ['🇮🇳', 'Indian Rupee'], 
                 'RUB': ['🇷🇺', 'Russian Ruble'], 
                 'ZAR': ['🇿🇦', 'South African Rand'], 
                 'TRY': ['🇹🇷', 'Turkish Lira'], 
                 'BRL': ['🇧🇷', 'Brazilian Real'], 
                 'TWD': ['🇹🇼', 'New Taiwan Dollar'], 
                 'DKK': ['🇩🇰', 'Danish Krone'], 
                 'PLN': ['🇵🇱', 'Polish Zloty'], 
                 'THB': ['🇹🇭', 'Thai Baht'], 
                 'IDR': ['🇮🇩', 'Indonesian Rupiah'], 
                 'HUF': ['🇭🇺', 'Hungarian Forint'], 
                 'CZK': ['🇨🇿', 'Czech Koruna'], 
                 'ILS': ['🇮🇱', 'Israeli New Shekel'], 
                 'CLP': ['🇨🇱', 'Chilean Peso'], 
                 'PHP': ['🇵🇭', 'Philippine Peso'], 
                 'AED': ['🇦🇪', 'UAE Dirham'], 
                 'COP': ['🇨🇴', 'Colombian Peso'], 
                 'SAR': ['🇸🇦', 'Saudi Riyal'], 
                 'MYR': ['🇲🇾', 'Malaysian Ringgit'], 
                 'RON': ['🇷🇴', 'Romanian Leu'],}


function App() {
  const [result, setResult] = useState("");

  const bellmanFord = (Adj, start) => {
    // initialization
    const distances = {};
    for (const key in Adj) {
      distances[key] = Infinity;
    }

    const parents = {};
    for (const key in Adj) {
      parents[key] = null;
    }

    distances[start] = 0;
    parents[start] = start;

    // constructing shortest paths in rounds
    const V = Object.keys(Adj).length;

    for (let i = 0; i < V-1; i++) {
      for (const u in Adj) {
        for (const v of Adj[u]) {
          if (distances[v[0]] > distances[u] + v[1]) {
            distances[v[0]] = distances[u] + v[1];
            parents[v[0]] = u;
          }
        }
      }
    }

    for (const u in Adj) {
      for (const v of Adj[u]) {
        if (distances[v[0]] > distances[u] + v[1]) {
          return [u, parents];
        }
      }
    }
    return null;
  }

  const getPath = (start, parent) => {
    const path = [start];
    let current = parent[start];

    while (current !== start) {
      path.push(current);
      current = parent[current];
    }

    path.push(start);

    let res = "";

    for (let i=0; i<path.length; i++) {
      if (i !== path.length - 1) {
        res += (path[i] + " " + currency_info[path[i]] + " --> ");
      }
      else {
        res += (path[i] + " " + currency_info[path[i]]);
      }
    }

    return res;
  }

  const getRequest = async (currency) => {
    return await axios.get("https://api.apilayer.com/exchangerates_data/latest?base=" + currency,
      {
        headers: {'apikey': "JxoI8AwWbK0gKgVJ3BUlPYEoQKG2B6GL"}
      });
  }

  const onClick = async () => {
    const adjacency_list = {}

    for (const currency1 of currencies) {
      var response;

      try {
        response = await getRequest(currency1);
      } catch (error) {
          console.log(error);
      }

      const current = response.data.rates;

      for (const currency2 of currencies) {
        var value = Math.log(current[currency2]);
        value = value.toFixed(5);
        if (currency2 !== currency1) {
          if (currency1 in adjacency_list === false) {
            adjacency_list[currency1] = [[currency2, value,]]
          } else {
            adjacency_list[currency1].push([currency2, value])
          }
        }
      }
    }

    console.log(adjacency_list);

    const bf = bellmanFord(adjacency_list, "USD");

    console.log(bf);

    if (bf !== null) {
      const temp = getPath(bf[0], bf[1]);
      setResult(temp);
    } else {
      setResult("Unfortunately, no arbitrage path between currencies could be found currently. Check back later!")
    }
  }

  return (
    <div>
      <Card style={{backgroundColor: '#3CB371', borderColor: '#3CB371', color: '#ffffff'}}>
      <div style={{textAlign:"center"}}>
        <h1>Foreign Exchange Arbitrage Finder</h1>
      </div>
      </Card>
      <div style={{textAlign:"center"}}>
        <Button
            style={{marginTop: '2%', marginBottom: '2%', backgroundColor: '#3CB371', borderColor: '#3CB371'}}
            onClick={onClick}
        >
          Search for Arbitrage
        </Button>
      </div>

      <Card style={{width: '60%', margin: 'auto', textAlign: 'center', backgroundColor: '#3CB371', borderColor: '#3CB371', color: '#ffffff'}}>
        <h3 style={{marginTop: '1%'}}>
          Arbitrage Path
        </h3>
      </Card>
        
      <Card style={{width: '60%', margin: 'auto', textAlign: 'center'}}>
        {result.length !== 0 ?
        <p style={{marginTop: '1%'}}>
          {result}
        </p>
        :
        <p style={{marginTop: '1%'}}>
          {"Press the button above to search for an arbitrage path if one exists."}
        </p>
        }
      </Card>

    </div>
  );
}

export default App;
