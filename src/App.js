import './App.css';
import axios from 'axios';
import { Button, Card, Form, } from "react-bootstrap";
import React, { useState } from 'react';

const currencies = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'NZD', 'SEK', 'KRW', 'SGD', 'NOK', 'MXN', 'INR', 'RUB', 'ZAR', 'TRY', 'BRL', 'TWD', 'DKK', 'PLN', 'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR', 'MYR', 'RON',]

var today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
const yyyy = today.getFullYear();

today = yyyy  + '-' + mm + '-' + dd;

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
  const [apiKey, setApiKey] = useState("");
  const [date, setDate] = useState(today);
  const [result, setResult] = useState("Press the button above to search for an arbitrage path if one exists after entering in your API key and choosing a date.");
  const [percentGain, setPercentGain] = useState("0")

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
        if (distances[v[0]] - (distances[u] + v[1]) > 0) {
            console.log(distances[v[0]] - (distances[u] + v[1]))
            let curr = v[0];

            for (let i = 0; i < V; i++) {
                curr = parents[curr];
            }

            let cycle = [];
            let vertex = curr;

            while (true) {
                cycle.push(vertex);
                if (vertex === curr && cycle.length > 1) {
                    break;
                }
                vertex = parents[vertex];
            }
            if (cycle.length > 3) {
              cycle = cycle.reverse();
              return cycle;
            }
        }
      }
    }
    return null;
  }

  const getWeight = (graph, node1, node2) => {
    for (const item of graph[node1]) {
      if (item[0] === node2) {
        return item[1]
      }
    }
    return null

  }

  const getOutput = (graph, cycle) => {
    let total = 0
    for (let i=0; i<(cycle.length-1); i++) {
      total += getWeight(graph, cycle[i], cycle[i+1])
    }

    total *= -1
    total = (Math.exp(total) - 1) * 100
    total = total.toFixed(3)

    let res = ""
    for (let i=0; i<(cycle.length); i++) {
      if (i !== cycle.length-1) {
        res += cycle[i] + " " + currency_info[cycle[i]][0] + " --> "
      }
      else {
        res += cycle[i] + " " + currency_info[cycle[i]][0]
      }
    }
    return [res, total]
  }

  const getRequest = async (currency, date, apiKey) => {
    return await axios.get("https://api.apilayer.com/exchangerates_data/" + date + "?base=" + currency,
      {
        headers: {'apikey': apiKey}
      });
  }

  const getAdjacencyList = async (currencies, date, apiKey) => {
    const adjacency_list = {}
    for (const currency1 of currencies) {
      var response;

      try {
        response = await getRequest(currency1, date, apiKey);
        const current = response.data.rates;
        console.log(response.data)
        for (const currency2 of currencies) {
          var value = -Math.log(current[currency2]);
          value = value.toFixed(5);
          if (currency2 !== currency1) {
            if (currency1 in adjacency_list === false) {
              adjacency_list[currency1] = [[currency2, value,]]
            } else {
              adjacency_list[currency1].push([currency2, value])
            }
          }
        }

      } catch (error) {
          console.log(error);
      }
    }
    return adjacency_list;

  }

  const onClick = async () => {
    console.log("check", apiKey, date)
    setResult("Searching for an arbitrage path...");

    const adjacency_list = await getAdjacencyList(currencies, date, apiKey)

    for (const key in adjacency_list) {
      for (const item of adjacency_list[key]) {
          item[1] = parseFloat(item[1])
      }
    }
    console.log(adjacency_list);

    const cycle = bellmanFord(adjacency_list, "USD");

    console.log(cycle);

    if (cycle !== null && cycle.length > 3) {
      const output = getOutput(adjacency_list, cycle)
      setResult(output[0]);
      setPercentGain(output[1]);
    } else if (Object.keys(adjacency_list).length === 0) {
      setResult("Either the date you entered or your API key is not valid. Please try again.");
    }
    else {
      setResult("Unfortunately, no arbitrage path between currencies could be found currently. Check back later!");
    }
  }

  return (
    <div>
      <Card style={{backgroundColor: '#3CB371', borderColor: '#3CB371', color: '#ffffff'}}>
      <div style={{textAlign:"center"}}>
        <h1>Foreign Exchange Arbitrage Finder</h1>
      </div>
      </Card>
      <div className="content-container">
            <div className="row">
              <Form.Group style={{display: 'flex', width: '60%', height: '10vh', margin: 'auto', marginTop: '2%', marginBottom: '2%'}}>
                <Form.Label style={{marginRight: '1%', margin: 'auto'}}>
                  API Key:
                </Form.Label>
                <Form.Control
                  type="text" 
                  className="form-control" 
                  placeholder="Enter in your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  style={{marginRight: '1%', width: '50%', height: '6vh', margin: 'auto'}}
                />
                <Form.Label style={{marginRight: '1%', margin: 'auto'}}>
                  Date:
                </Form.Label>
                <Form.Control
                  type="text" 
                  className="form-control" 
                  placeholder="YYYY-MM-DD"
                  defaultValue={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{marginRight: '1%', width: '20%', height: '6vh', margin: 'auto'}}
                />
                <Button
                    style={{marginTop: '2%', marginBottom: '2%', marginLeft: '1%', backgroundColor: '#3CB371', borderColor: '#3CB371', display: 'flex'}}
                    onClick={onClick}
                >
                  Search
                </Button>
              </Form.Group>
        </div>
      </div>

      <Card style={{width: '60%', margin: 'auto', textAlign: 'center', backgroundColor: '#3CB371', borderColor: '#3CB371', color: '#ffffff'}}>
        <h3 style={{marginTop: '1%'}}>
          Arbitrage Path
        </h3>
      </Card>
        
      <Card style={{width: '60%', margin: 'auto', textAlign: 'center'}}>
        <div>
          <p style={{marginTop: '1%'}}>
            {result}
          </p>
          {result !== "Searching for an arbitrage path..." 
            && result !== "Either the date you entered or your API key is not valid. Please try again." 
            && result !== "Press the button above to search for an arbitrage path if one exists after entering in your API key and choosing a date." 
            && result !== "Unfortunately, no arbitrage path between currencies could be found currently. Check back later!" ?
              <p style={{marginTop: '1%'}}>
                By following this arbitrage path, you will gain {percentGain}% profit.
              </p>
              : 
              console.log()
          }
        </div>
      </Card>

    </div>
  );
}

export default App;
