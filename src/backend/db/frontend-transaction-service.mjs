import FrontendTransaction from '../schema/frontend-transaction.mjs';
import userService from './user-service.mjs';
import errorThrower from '../helpers/error-thrower.mjs';
import web3 from '../../helpers/web3Instance.mjs';

export default {
  addTransaction: async (userAddress, transactionType, timestamp, txHash) => {
    let user = await userService.getUserByEthereumAddress(userAddress);
    if (!user)
      errorThrower.noEntryFoundById('SC Transactions service: ' + userAddress);
    const tx = new FrontendTransaction({
      ownerAddress: userAddress,
      transactionType: transactionType,
      timestamp: timestamp,
      txHash: txHash
    });
    await tx.save();
    return tx._id;
  },
  getAllTxs: async address => {
    const txs = await FrontendTransaction.find({
      ownerAddress: address
    });
    if (!txs) errorThrower.noEntryFoundById(address);

    const txHash = txs[0].txHash;
    await web3.eth
      .getTransactionReceipt(txHash)
      .then(receipt => {
        console.log(receipt );
        if (receipt) {
          txs[0].blockNumber = receipt.blockNumber;
          // for private testnet || for metamask
          txs[0].confirmed =
            receipt.status.toString().includes('0x01') ||
            receipt.status === '0x1';
        }
      })
      .catch(reason => {
        console.log(reason);
      });

    return txs;
  },
  deleteTransaction: async userAddress => {}
};