const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, {
    from: user2,
    value: balance,
    // gasPrice: 100000, // Test won't complete because of gas
  });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(Math.floor(value / 10 ** 17), Math.floor(starPrice / 10 ** 17));
});

// Implement Task 2 Add supporting unit tests

it("can add the star name and star symbol properly", async () => {
  const instance = await StarNotary.deployed();
  const tokenName = await instance.name.call();
  const tokenSymbol = await instance.symbol.call();
  assert.equal(tokenName, "Notarized Star");
  assert.equal(tokenSymbol, "NTS");
});

it("lets 2 users exchange stars", async () => {
  const user1 = accounts[1];
  const user2 = accounts[2];
  const tokenOneID = 6;
  const tokenTwoID = 7;
  const tokenOneName = "Star One!";
  const tokenTwoName = "Star Two!";
  const instance = await StarNotary.deployed();
  await instance.createStar(tokenOneName, tokenOneID, { from: user1 });
  await instance.createStar(tokenTwoName, tokenTwoID, { from: user2 });
  await instance.exchangeStars(tokenOneID, tokenTwoID, { from: user1 });

  const ownerOneCheck = await instance.ownerOf.call(tokenOneID);
  const ownerTwoCheck = await instance.ownerOf.call(tokenTwoID);

  assert.equal(ownerOneCheck, user2);
  assert.equal(ownerTwoCheck, user1);
});

it("lets a user transfer a star", async () => {
  const user1 = accounts[1];
  const user2 = accounts[2];
  const tokenID = 8;
  const tokenName = "Star Three!";
  const instance = await StarNotary.deployed();
  await instance.createStar(tokenName, tokenID, { from: user1 });
  await instance.transferStar(user2, tokenID, { from: user1 });

  const ownerCheck = await instance.ownerOf.call(tokenID);
  assert.equal(ownerCheck, user2);
});

it("lookUptokenIdToStarInfo test", async () => {
  const user1 = accounts[1];
  const tokenID = 9;
  const tokenName = "Star Nine!";
  const instance = await StarNotary.deployed();
  await instance.createStar(tokenName, tokenID, { from: user1 });
  const matchingName = await instance.lookUptokenIdToStarInfo.call(tokenID);
  assert.equal(matchingName, tokenName);
});
