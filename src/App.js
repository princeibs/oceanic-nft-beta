import { Navigation, Main, Footer } from "./components";
import "./App.css";
import { useEffect, useState } from "react";
import { useNftContract } from "./hooks";
import { useWallet } from "./utils/Wallet";

function App() {
  const contract = useNftContract();
  const { connectWallet } = useWallet();

  return (
    <div className="App">
      {contract ? (
        <div>
          {/* {console.log("contract-> " + JSON.stringify(contract, null, 4))} */}
          <Navigation />
          <Main contract={contract} />
          <Footer />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}

export default App;
