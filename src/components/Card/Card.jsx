import React from "react";
import ethIcon from "../../assets/image/eth-icon.png";
import { useWallet } from "../../utils/Wallet";
import "./Card.scss";

const Card = ({ data, btnText, btnAction }) => {
  const { defaultAccount } = useWallet();
  return (
    <div className="card">
      <div className="card-image">
        <img src={data.image} alt="card-img" />
      </div>
      {/* <hr /> */}
      <div className="card-content">
        <div className="content-text">
          <div className="content-title">{data.name}</div>
          <div className="content-desc">{data.description}</div>
        </div>
        <div className="card-attrib">
          {data.attributes.map((attrib) => (
            <div className="attrib-div">
              <div className="attrib-name">{attrib.trait_type}</div>
              <div className="attrib-value">{attrib.value}</div>
            </div>
          ))}
        </div>
        <div className="content-action">
          <div className="price">
            <img src={ethIcon} alt="eth-icon" />
            {data.value} (${Number(data.convertedVal).toFixed(2)})
          </div>
          {data.seller == defaultAccount ? (
            <div>Owned</div>
          ) : (
            <div
              className="buy-btn"
              onClick={() => btnAction(data.tokenId, data.value)}
            >
              {btnText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
