# Foreign Exchange Arbitrage Finder

This website was developed using React and can be found at the following link:
https://sharafrashid2.github.io/forex-arbitrage-finder/

## About

The purpose of this project is to look at currency exchange rates and find arbitrages in currency rates if any exist. To clarify, an arbitrage is the simultaneous purchase and sale of the same asset in different markets (in our case, different currencies) in order to profit from tiny differences in the asset's listed prices. The way this is done is through creating a graph where the vertices are the currencies and the edges are the exchange rates between currencies. Then, the Bellman-Ford algorithm is used to check for a negative weight cycle (this indicates that an arbitrage exists) and return the arbitrage path if one is found. Before using the Bellman-Ford algorithm though, each edge weight has to be modified to be the negative log of its actual exchange rate because normally in an arbitrage path, (for example, currency1->currency2 * currency2->currency3 * currency3->currency1) the product of the exchange rates in the cycle should be greater than 1. In the Bellman-Ford algorithm, a negative cycle (for example, x -> y -> z -> x) is one where the sum of the weights in the cycle is less than one. Thus, doing the operation described above allows Bellman-Ford to work on our graph.

Note that only the top 35 most traded currencies are looked at (https://en.wikipedia.org/wiki/Template:Most_traded_currencies) and all exchange rate information is pulled from the Exchange Rates API which can be found at the following site: https://exchangeratesapi.io. To check for arbitrages, you need to first sign up for an API key (which has a free option) here and enter the key that you receive into this website. Also, the site can't be used for actual trading purposes since the Exchange Rates API does not update in real time but only daily.

## Examples

Arbitrages in foreign currency exchange doesn't happen frequently. To see this website find one, try the date, 2017-07-23.
