import React from "react";
import { Link } from "react-router-dom";
import Jazzicon from "react-jazzicon";
import { useState } from "react";
import "./Navigation.scss";
import { useWallet } from "../../utils/Wallet";

const Navigation = () => {
  const { defaultAccount, connectWallet } = useWallet();
  const truncateAddress = (_address) => {
    if (!_address) return;
    const address = _address.toString();
    return (
      address.slice(0, 5) +
      "..." +
      address.slice(address.length - 4, address.length)
    );
  };

  return (
    <div className="app__nav">
      <div className="app__nav-logo">Oceanic</div>
      <div className="app__nav-links">
        <div className="links">
          <Link to="/">Market</Link>
        </div>
        <div className="links">
          <Link to="/profile">Profile</Link>
        </div>
        <div className="links">
          <Link to="/lab">Lab</Link>
        </div>
      </div>
      <div className="app__nav-profile">
        {defaultAccount ? (
          <div className="profile-true">
            <a
              className="profile-icon"
              href={`https://rinkeby.etherscan.io/address/${defaultAccount}`}
            >
              <Jazzicon
                diameter={50}
                seed={parseInt(defaultAccount.slice(2, 10), 16)}
              />
            </a>
            <a
              href={`https://rinkeby.etherscan.io/address/${defaultAccount}`}
              className="profile-address"
            >
              {truncateAddress(defaultAccount)}
            </a>
          </div>
        ) : (
          <div className="profile-false" onClick={() => connectWallet()}>
            Connect
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
