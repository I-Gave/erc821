import assertRevert, { assertError } from './helpers/assertRevert'

import getEIP820 from './helpers/getEIP820'

const BigNumber = web3.BigNumber

const WeightedAssetRegistryTest = artifacts.require('WeightedAssetRegistryTest')
const Holder = artifacts.require('Holder')
const NonHolder = artifacts.require('NonHolder')

const NONE = '0x0000000000000000000000000000000000000000'

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('WeightedAssetRegistryTest', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let registry = null
  let EIP820 = null
  const _name = 'Test'
  const _symbol = 'TEST'
  const _description = 'lorem ipsum'
  const _firstAssetlId = 1
  const alternativeAsset = { id: 2, data: 'data2' }
  const sentByCreator = { from: creator }
  const sentByUser = { from: user }
  const creationParams = {
    gas: 4e6,
    gasPrice: 21e9,
    from: creator
  }
  const CONTENT_DATA = 'test data'

  beforeEach(async () => {
    registry = await WeightedAssetRegistryTest.new(creationParams)
    EIP820 = await getEIP820(creator)
    await registry.generate(0, creator, CONTENT_DATA, 100, sentByCreator)
    await registry.generate(1, creator, CONTENT_DATA, 250, sentByCreator)
  })


  describe('Weight', () => {
    it('is weighted', async () => {
      const isWeighted = await registry.isWeighted()

      isWeighted.should.be.equal(true)
    })
    it('has a total weight equal to the created weight', async () => {
      const totalWeight = await registry.totalWeight()

      totalWeight.should.be.bignumber.equal(350)
    })
    it('has asset weight equal to the creation weight', async () => {
      const assetWeight0 = await registry.weightOfAsset(0)
      const assetWeight1 = await registry.weightOfAsset(1)

      assetWeight0.should.be.bignumber.equal(100);
      assetWeight1.should.be.bignumber.equal(250);
    })
    it('has a holder weight equal to their holdings', async () => {
      const holderWeight = await registry.weightOfHolder(creator)

      holderWeight.should.be.bignumber.equal(350)
    })
  })

  describe('Accounting', () => {
    it('Changes the weight of an asset', async () => {
      await registry.changeWeight(0, 0, sentByCreator)

      const assetWeight0 = await registry.weightOfAsset(0)
      const totalWeight = await registry.totalWeight()

      assetWeight0.should.be.bignumber.equal(0)
      totalWeight.should.be.bignumber.equal(250)
    })
    it('Transfers an asset', async () => {
      await registry.transfer(mallory, 1, sentByCreator)

      const creatorWeight = await registry.weightOfHolder(creator)
      const malloryWeight = await registry.weightOfHolder(mallory)
      const totalWeight = await registry.totalWeight()

      creatorWeight.should.be.bignumber.equal(100)
      malloryWeight.should.be.bignumber.equal(250)
      totalWeight.should.be.bignumber.equal(350)
    })
    it('Decreases an asset value', async () => {
      const changeWeight = 150;
      const oldTotalWeight = await registry.totalWeight();
      const oldAssetWeight = await registry.weightOfAsset(1);

      await registry.update(1, '', changeWeight);

      const newTotalWeight = await registry.totalWeight();
      const newAssetWeight = await registry.weightOfAsset(1);

      const assetChange = oldAssetWeight - newAssetWeight

      newAssetWeight.should.be.bignumber.equal(oldAssetWeight - assetChange)
      newTotalWeight.should.be.bignumber.equal(oldTotalWeight - assetChange)
    })
    it('Increases an asset value', async () => {
      const changeWeight = 350;
      const oldTotalWeight = await registry.totalWeight();
      const oldAssetWeight = await registry.weightOfAsset(1);

      await registry.update(1, '', changeWeight);

      const newTotalWeight = await registry.totalWeight();
      const newAssetWeight = await registry.weightOfAsset(1);

      const assetChange = oldAssetWeight - newAssetWeight

      newAssetWeight.should.be.bignumber.equal(oldAssetWeight - assetChange)
      newTotalWeight.should.be.bignumber.equal(oldTotalWeight - assetChange)
    })
    it('Destroys an asset', async () => {
      const oldWeight = await registry.totalWeight();
      let assetWeight = await registry.weightOfAsset(1);
      await registry.destroy(1);
      const newWeight = await registry.totalWeight();

      const correctWeight = oldWeight - assetWeight

      newWeight.should.be.bignumber.equal(correctWeight)
      assetWeight = await registry.weightOfAsset(1);
      assetWeight.should.be.bignumber.equal(0)
    })
    it('Creates an asset', async () => {
      const assetWeight = 1000;
      const oldWeight = await registry.totalWeight();
      await registry.generate(2, creator, CONTENT_DATA, assetWeight)
      const newWeight = await registry.totalWeight();

      newWeight.should.be.bignumber.equal(oldWeight.toNumber() + assetWeight)
    })
  })
})

