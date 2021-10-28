// Node Modules
import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation} from '@apollo/client';
// Utilities
import Auth from '../utils/auth';
import { QUERY_USERS, QUERY_USER, QUERY_ME, QUERY_LEVEL } from '../utils/queries';
import { ALLOCATE_UNIT, GET_UPDATED_RESOURCES } from '../utils/mutations';
// Components
import UserList from '../components/UserList';

import ManageState from '../components/ManageState';

const Profile = () => {
  const { id } = useParams();
  const [lastUpdate, setLastUpdate] = useState(null)
  const [syncDataFlag, setSyncDataFlag] = useState(true);
  const [intervalId, setIntervalId] = useState("intervalId");
  const [type, setType] = useState(null);
  const [resources, setResources] = useState({
    fruit: 0,
    meat: 0,
    gold: 0,
    wood: 0
  }); //set up the resources state, which will be used to get the resources from the server and update them. will be an object with keys for each resource

  const [oResources, setoResources] = useState({
    fruit: 0,
    meat: 0,
    gold: 0,
    wood: 0
  });  //original resources

  const [workers, setWorkers] = useState({ //how many workers for each resource
    fruit: 0,
    meat: 0,
    gold: 0,
    wood: 0
  });

  const [allocateUnit, { data: unitData, loading: unitsLoading, error: unitError }] = useMutation(ALLOCATE_UNIT);
  const [getUpdatedResources, { data: updateData, loading: updateLoading, error: updateError}] = useMutation(GET_UPDATED_RESOURCES)
  
  // Get current user
  const { loading, data, error} = useQuery(id ? QUERY_USER : QUERY_ME, {
    variables: { id }
  });

  // Get a list of all users
  const { usersLoading, data: usersData } = useQuery(QUERY_USERS);
  const user = data?.me || data?.user || {};
  const users = usersData?.users || [];

  const [currentLevel, { data: levelData }] = useLazyQuery(QUERY_LEVEL);

  useEffect(() => {
    if (user?.village?.level) {
      currentLevel({
        variables: { level: user.village.level },
      });
    }
  }, [currentLevel, user?.village?.level]);

  const level = levelData?.level || {};

  if (loading || usersLoading) {
    return <h4>Loading...</h4>;
  }

  if (error) console.log(error);

  const handleClose = () => {
    setType(null);
  }

  //const [gameLoopInit, setGameLoopInit] = useState(false); //have we set up the game loop? 
  var gameLoopTimer;
  useEffect(() => { //make this not async and create new function to fetch server data
    if (!loading) {
      if (user?.username && syncDataFlag) { //set resources to correct amount 
        syncData();
        console.log("USE EFFECT")
        
        //setGameLoopInit(true);
      }
    }
  }, [loading, syncDataFlag]);

  
  useEffect(() => {
    if (user) {
      clearInterval(intervalId);
      //gameLoopTimer = null;
      setIntervalId(setInterval(gameLoop, 500));
    }
  }, [workers]);

  const gameLoop = () => { //TODO: Rework gameloop to render not based on time since last frame, but time since the information was refreshed
    let now = new Date();
    let deltaTime = Math.abs(now - lastUpdate) / 1000;
    if (user.village) {
     
     let { abundanceOfResources } = user.village;
      let temp = { ...resources };
      for (let resource in temp) {

        temp[resource] = (oResources[resource] + workers[resource] * abundanceOfResources[resource] * deltaTime);
        //console.log(workers[resource])
      }

      setResources({
        fruit: Math.round(temp.fruit * 10) / 10,
        meat: Math.round(temp.meat * 10) / 10,
        gold: Math.round(temp.gold * 10) / 10,
        wood: Math.round(temp.wood * 10) / 10
      })
      console.log(oResources)
      //setLastUpdate(new Date());
    }
  }

  const syncData = async () => { //syncs client and server data
    //await refetch()
    if (!loading) {
      setSyncDataFlag(false);
      //var { amountOfResources: resourceCount, unitAllocation, abundanceOfResources } = user.village;
      let update = await getUpdatedResources();
      setLastUpdate(new Date());
      let { amountOfResources: resourceCount, unitAllocation, abundanceOfResources } = update.data.getUpdatedResources
      console.log(JSON.parse(JSON.stringify(unitAllocation)));
      setResources({
        fruit: resourceCount.fruit,
        meat: resourceCount.meat,
        gold: resourceCount.gold,
        wood: resourceCount.wood
      });
      setoResources({
        fruit: resourceCount.fruit,
        meat: resourceCount.meat,
        gold: resourceCount.gold,
        wood: resourceCount.wood
      });
      setWorkers({
        fruit: unitAllocation.fruit,
        meat: unitAllocation.meat,
        gold: unitAllocation.gold,
        wood: unitAllocation.wood
      });
      console.log(JSON.parse(JSON.stringify(workers)));
      return true;
    }
  };



  //const [gameLoopInit, setGameLoopInit] = useState(false); //have we set up the game loop? 
  var gameLoopTimer;
  useEffect(() => { //make this not async and create new function to fetch server data
    if (!loading) {
      if (user?.username && syncDataFlag) { //set resources to correct amount 
        syncData();
        console.log("USE EFFECT")
        
        //setGameLoopInit(true);
      }
    }
  }, [loading, syncDataFlag]);

  
  useEffect(() => {
    console.log(JSON.parse(JSON.stringify(user)));
    if (user) {
      clearInterval(intervalId);
      //gameLoopTimer = null;
      console.log("I work!", workers);
      setIntervalId(setInterval(gameLoop, 500));
    }
  }, [workers]);

  const gameLoop = () => { //TODO: Rework gameloop to render not based on time since last frame, but time since the information was refreshed
    let now = new Date();
    let deltaTime = Math.abs(now - lastUpdate) / 1000;
    if (user.village) {
     
     let { abundanceOfResources } = user.village;
      let temp = { ...resources };
      for (let resource in temp) {

        temp[resource] = (oResources[resource] + workers[resource] * abundanceOfResources[resource] * deltaTime);
        //console.log(workers[resource])
      }

      setResources({
        fruit: Math.round(temp.fruit * 10) / 10,
        meat: Math.round(temp.meat * 10) / 10,
        gold: Math.round(temp.gold * 10) / 10,
        wood: Math.round(temp.wood * 10) / 10
      })
      console.log(oResources)
      //setLastUpdate(new Date());
    }
  }

  const syncData = async () => { //syncs client and server data
    //await refetch()
    if (!loading) {
      setSyncDataFlag(false);
      //var { amountOfResources: resourceCount, unitAllocation, abundanceOfResources } = user.village;
      let update = await getUpdatedResources();
      setLastUpdate(new Date());
      let { amountOfResources: resourceCount, unitAllocation, abundanceOfResources } = update.data.getUpdatedResources
      console.log(JSON.parse(JSON.stringify(unitAllocation)));
      setResources({
        fruit: resourceCount.fruit,
        meat: resourceCount.meat,
        gold: resourceCount.gold,
        wood: resourceCount.wood
      });
      setoResources({
        fruit: resourceCount.fruit,
        meat: resourceCount.meat,
        gold: resourceCount.gold,
        wood: resourceCount.wood
      });
      setWorkers({
        fruit: unitAllocation.fruit,
        meat: unitAllocation.meat,
        gold: unitAllocation.gold,
        wood: unitAllocation.wood
      });
      console.log(JSON.parse(JSON.stringify(workers)));
      return true;
    }
  };



  // redirect to personal profile page if username is yours
  if (Auth.loggedIn() && Auth.getProfile().data._id === id) {
    return <Redirect to="/me" />;
  }


  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  const renderUserList = () => {
    if (usersLoading) return null;
    // Only renders users who's profile we're not currently viewing
    const notMeUsers = users.filter(o => o._id !== user._id);
    return <UserList users={notMeUsers} title="User List" />;
  };

  const renderCurrentUserInfo = () => {
    if (id) return null;
    return (
      <ul>
        <h3>Username:</h3>
        <p>{user.username}</p>
        <h3>Email:</h3>
        <p>{user.email}</p>
      </ul>
    );
  }

  const addWorker = async (e) => {
    let tempWorkers = workers;
    let totalWorkers = 0;
    console.log(workers)
    for (let r in workers) {
      totalWorkers += workers[r]
    }
    console.log(totalWorkers, user.village.population)
    if (totalWorkers + 1 <= user.village.population) {
      tempWorkers[e.target.id] += 1;
      await allocateUnit({ variables: { userId: user._id,  resource: e.target.id, amount: 1} });
      clearInterval(gameLoopTimer)
      setSyncDataFlag(true);
    }
  }

  const subtractWorker = async (e) => {
    let tempWorkers = workers;
    if (tempWorkers[e.target.id] - 1 >= 0) {
      tempWorkers[e.target.id] -= 1;
      await allocateUnit({ variables: { userId: user._id,  resource: e.target.id, amount: -1} });
      clearInterval(gameLoopTimer)
      setSyncDataFlag(true)
    }
  }


  if (loading || usersLoading) {
    return <h4>Loading...</h4>;
  } else {
    return (
      <div className="wrapper" style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/img/hamlet2.jpg)`
      }}>
        <div className="jumbotron jumbotron-fluid screenWidth">

          <div className="profileTable">
            <section>
              <h1 className="display-4 tableTitle">{user.username}'s {level.name}</h1>

              <table className="table table-hover">

                <tbody className="rows">
                  <tr className="cell">
                    <th scope="row">🧍‍♂️ POPULATION:</th>
                    <td>{user.village.population}</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">🍎 FRUIT:</th>
                    <td>{resources.fruit}</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">🥩 MEAT:</th>
                    <td>{resources.meat}</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">💰 GOLD:</th>
                    <td>{resources.gold}</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">🌲 WOOD:</th>
                    <td>{resources.wood}</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row"># of TRADES:</th>
                    <td>3</td>
                  </tr>
                </tbody>
              </table>
              <button type="submit" className="btn request-btn" id="request-btn">REQUEST A TRADE!</button>

            </section>
            <div className="imageCard">
              <img src={`${process.env.PUBLIC_URL}/img/levels/${level.image}`} alt={level.name} />
            </div>
          </div>


          <div className="manageBox">
            <div className="cardManage" style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}/img/backtest.jpg)`
            }}>
              <ManageState
                type={type}
                setType={setType}
                handleClose={handleClose}
                user={user}
                level={level}
              />
              <h1>Manage Village</h1>
            </div>

            <div className="abCard overflow-auto">
              <table className="table table-hover">
                <thead>
                  <th scope="col">Resource</th>
                  <th scope="col">Abundance</th>
                  <th scope="col">Workers</th>
                  <th scope="col">Upgrades</th>
                  <th scope="col">Earnings</th>
                </thead>
                <tbody className="rows2">
                  <tr className="cell">
                    <th scope="row">🍎 FRUIT:</th>
                    <td>{user.village.abundanceOfResources.fruit}</td>
                    <td>{workers.fruit}</td>
                    <td>{user.village.upgrades.fruit.length}</td>
                    <td>*{resources.fruit} #/sec</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">🥩 MEAT:</th>
                    <td>{user.village.abundanceOfResources.meat}</td>
                    <td>{workers.meat}</td>
                    <td>{user.village.upgrades.meat.length}</td>
                    <td>*{resources.meat} #/sec</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">💰 GOLD:</th>
                    <td>{user.village.abundanceOfResources.gold}</td>
                    <td>{workers.gold}</td>
                    <td>{user.village.upgrades.gold.length}</td>
                    <td>*{resources.gold} #/sec</td>
                  </tr>
                  <tr className="cell">
                    <th scope="row">🌲 WOOD:</th>
                    <td>{user.village.abundanceOfResources.wood}</td>
                    <td>{workers.wood}</td>
                    <td>{user.village.upgrades.wood.length}</td>
                    <td>*{resources.wood} #/sec</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    );
  }
};

export default Profile;