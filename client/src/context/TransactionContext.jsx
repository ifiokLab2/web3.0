import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";

export const TransactionContext = React.createContext();

const { ethereum } = window;

// ✅ async + Ethers v6
const createEthereumContract = async () => {
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return;

      const contract = await createEthereumContract();
      const availableTransactions = await contract.getAllTransactions();

      const structuredTransactions = availableTransactions.map((tx) => ({
        addressTo: tx.receiver,
        addressFrom: tx.sender,
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        message: tx.message,
        keyword: tx.keyword,
        amount: Number(ethers.formatEther(tx.amount)),
      }));

      setTransactions(structuredTransactions);
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        await getAllTransactions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      if (!ethereum) return;

      const contract = await createEthereumContract();
      const count = await contract.getTransactionCount();

      localStorage.setItem("transactionCount", Number(count));
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };


const sendTransaction = async () => {
  try {
    if (!ethereum) return alert("Please install MetaMask.");

    const { addressTo, amount, keyword, message } = formData;

    const cleanAddress = addressTo.trim(); // ✅ FIX

    if (!ethers.isAddress(cleanAddress)) {
      return alert("Invalid Ethereum address");
    }

    const parsedAmount = ethers.parseEther(amount);
    const contract = await createEthereumContract();

    await ethereum.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: currentAccount,
          to: cleanAddress,
          gas: "0x5208",
          value: parsedAmount.toString(),
        },
      ],
    });

    const tx = await contract.addToBlockchain(
      cleanAddress,
      parsedAmount,
      message,
      keyword
    );

    setIsLoading(true);
    await tx.wait();
    setIsLoading(false);

    const count = await contract.getTransactionCount();
    setTransactionCount(Number(count));
  } catch (error) {
    console.error(error);
  }
};



  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
