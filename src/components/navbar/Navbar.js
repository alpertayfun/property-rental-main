import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../images/logo/logo.png";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import { useEffect,useState,Link } from "react"
import { EIP6963EventNames, LOCAL_STORAGE_KEYS, isPreviouslyConnectedProvider } from "../../config"
import  WalletButton from "../functions/WalletButton"

function NavBar() {

  const [injectedProviders, setInjectedProviders] = useState(new Map())

  const [connection, setConnection] = useState(null)

   useEffect(() => {
      /**
       * @title onAnnounceProvider
       * @dev Event listener for EIP-6963 announce provider event.
       * @param event The announce provider event.
       */
      const onAnnounceProvider = event => {
        const { icon, rdns, uuid, name } = event.detail.info
  
        if (!icon || !rdns || !uuid || !name) {
          console.error("invalid eip6963 provider info received!")
          return
        }
        setInjectedProviders(prevProviders => {
          const providers = new Map(prevProviders)
          providers.set(uuid, event.detail)
          return providers
        })
  
        // This ensures that on page reload, the provider that was previously connected is automatically connected again.
        // It help prevent the need to manually reconnect again when the page reloads
        if (isPreviouslyConnectedProvider(rdns)) {
          handleConnectProvider(event.detail)
        }
      }
  
      // Add event listener for EIP-6963 announce provider event
      window.addEventListener(EIP6963EventNames.Announce, onAnnounceProvider)
  
      // Dispatch the request for EIP-6963 provider
      window.dispatchEvent(new Event(EIP6963EventNames.Request))
  
      // Clean up by removing the event listener and resetting injected providers
      return () => {
        window.removeEventListener(EIP6963EventNames.Announce, onAnnounceProvider)
        setInjectedProviders(new Map())
      }
    }, [])


     /**
   * @title handleConnectProvider
   * @dev Function to handle connecting to a provider.
   * @param selectedProviderDetails The selected provider details.
   */
  async function handleConnectProvider(selectedProviderDetails) {
    const { provider, info } = selectedProviderDetails
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts"
      })
      const chainId = await provider.request({ method: "eth_chainId" })
      setConnection({
        providerUUID: info.uuid,
        accounts,
        chainId: Number(chainId)
      })
      localStorage.setItem(
        LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS,
        info.rdns
      )
    } catch (error) {
      console.error(error)
      throw new Error("Failed to connect to provider")
    }
  }

  /**
   * @title handleDisconnect
   * @dev Function to handle disconnecting from the provider.
   */
  const handleDisconnect = () => {
    setConnection(null)
    localStorage.removeItem(
      LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS
    )
  }

  const sendEth = () => {    console.log("sendeth... ")  }  
  
  const connectedInjectectProvider =    connection && injectedProviders.get(connection.providerUUID)

  return (
    <Navbar expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="#" className="me-lg-5">
          <img className="logo" src={logo} alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1">Marketplace</Nav.Link>
            <Nav.Link href="#action2" className="px-lg-3">
              About Us
            </Nav.Link>
            <Nav.Link href="#action3">Developers</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <div className="d-flex align-items-center order">
          <span className="line d-lg-inline-block d-none"></span>
           {injectedProviders.size === 0 ? (
             <div>
                    Download Metamask
                </div>
              ) : (
              <div>
                {connectedInjectectProvider?.info ? (
                  <div>
                  {connection?.accounts.map(
                        (account) => (
                            <span key={account}>
                                {account}
                            </span>
                        )
                    )}
                     <Button onClick={handleDisconnect}>
                                            Disconnect
                                        </Button>
                  </div>
                ):(
                  <div>
                  {Array.from(injectedProviders).map(
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ([_, { info, provider }]) => (
                      
                      <WalletButton
                       variant="primary"
                        className="btn-primary d-none d-lg-inline-block"
                      key={info.uuid}
                      handleConnect={handleConnectProvider}
                      walletDetails={{ info, provider }}
                      isConneted={connection?.providerUUID === info.uuid}
                      >Connect Wallet</WalletButton>
                    )
                  )}
                  </div>
                )
                }
                   
                </div>
          )}
        </div>
      </Container>
    </Navbar>
  );
}

export default NavBar;
