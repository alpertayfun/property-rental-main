import { Button } from "react-bootstrap";

const WalletButton = ({ walletDetails, handleConnect, isConneted }) => {
  return (
    <Button
      onClick={() => handleConnect(walletDetails)}
      className="flex"
      disabled={isConneted}
    >
      <img
        className="w-5 h-5 rounded"
        src={walletDetails.info.icon}
        alt={walletDetails.info.name}
      />
      <span>{walletDetails.info.name}</span>
      {isConneted}
    </Button>
  )
}

export default WalletButton
