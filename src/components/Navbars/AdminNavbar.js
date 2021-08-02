import React from "react";
import axios from "axios";
import Modal from "react-modal";
import "assets/css/style-1.css"
import {
  Input,
  InputGroup,
  Navbar,
  Button,
  Card,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col,
  CardHeader,
  CardFooter,
  Table,

} from "reactstrap";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'grey',
    borderRadius: '10px'
  },
};

class AdminNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this)
    this.handleScholar = this.handleScholar.bind(this)
    this.handleName = this.handleName.bind(this)
    this.state = {
      data: [],
      name_group: [],
      ronin_address_group: [],
      all_total:
      {
        "avg": 0,
        "tot_avg": 0,
        "today_so": 0,
        "unclaimed": 0,
        "ronin_slp": 0,
        "scholar": 0,
        "manager": 0,
        "total": 0
      },
      ronin_address: "",
      percent: "",
      name: "",
      scholar_count: 0,
      show: false,
      name_now: "",
      ronin_now: "",
      manager_percent_now: "",
      index_now: ""
    };
  }

  handleChange = (e) => {
    this.setState({ ronin_address: e.target.value });
  };
  handleScholar = (e) => {
    this.setState({ percent: e.target.value });
  };
  handleName = (e) => {
    this.setState({ name: e.target.value });
  };
  cg_name = (e) => {
    this.setState({ name_now: e.target.value });
  };
  cg_ronin = (e) => {
    this.setState({ ronin_now: e.target.value });
  }
  cg_mn_pcent = (e) => {
    this.setState({ manager_percent_now: e.target.value });
  }
  // When you click the add scholar button
  get_ronin() {
    let this_one = this;
    // Get the draft manager percentage
    let percent_manager = this.state.percent;

    // Verify if the address is true
    let ronin = this.state.ronin_address;
    let n = ronin.search(/ronin:/i);
    if (n === 0 && ronin.length === 46 &&
      percent_manager > 0 &&
      101 > percent_manager &&
      this.state.name !== "" &&
      !this.state.name_group.includes(this.state.name) &&
      !this.state.ronin_address_group.includes(this.state.ronin_address)) {

      document.getElementById("cover-spin").style.display = "inherit";

      ronin = ronin.replace("ronin:", "0x")
      axios
        .get('https://api.axie.management/v1/overview/' + ronin)
        .then(function (response) {
          if (response.data.slp.lastClaimedItemAt === 0) {
            alert("Wrong input data! Try again")
          }
          else {
            // Add name to the name_group
            let new_name = this_one.state.name;
            this_one.setState(state => {
              const name_group = state.name_group.concat(new_name);
              return {
                name_group
              };
            });

            // Add ronin_address to the ronin_address_group
            let new_ronin_address = this_one.state.ronin_address;
            this_one.setState(state => {
              const ronin_address_group = state.ronin_address_group.concat(new_ronin_address);
              return {
                ronin_address_group
              };
            });

            // Calculate scholar count
            let scholar_count = this_one.state.scholar_count + 1;
            this_one.setState({ scholar_count: scholar_count });

            // Calculate total slp
            let total_one = response.data.slp.total;
            let tot_total_one = this_one.state.all_total.total + total_one;


            // Calculate claimed slp
            let claimed = response.data.slp.claimableTotal;
            let tot_claimed = this_one.state.all_total.ronin_slp + claimed;

            // Calculate unclaimed slp
            let unclaimed = total_one - claimed;
            let tot_unclaimed = this_one.state.all_total.unclaimed + unclaimed;

            // Calculate the last claimed date
            let timestamp = response.data.slp.lastClaimedItemAt;
            let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let today = new Date();
            let last_date = new Date(timestamp * 1000);
            let last_claimed_date = last_date.toLocaleDateString();
            this_one.setState({ last_date: last_claimed_date });

            // Calculate average slp 
            let diffDays = Math.ceil(Math.abs((today - last_date + 1) / oneDay));
            let avg_slp = Math.floor(unclaimed / diffDays);
            let tot_avg_slp = this_one.state.all_total.tot_avg + avg_slp;
            let real_avg_slp = Math.floor(tot_avg_slp / scholar_count);

            // Calculate manager
            let manager = Math.round(total_one / 100 * percent_manager);
            let tot_manager = this_one.state.all_total.manager + manager;

            // Calculate scholar
            let scholar = total_one - manager;
            let tot_scholar = this_one.state.all_total.scholar + scholar;

            // Calculate today so far 
            // if today so far is null, return "no result"
            let today_so = response.data.slp.todaySoFar;
            let tot_today_so = this_one.state.all_total.today_so + today_so;

            // Calculate the next claim date
            let next_date_ready = new Date(last_date.setDate(last_date.getDate() + 14));
            let next_claim_date = next_date_ready.toLocaleDateString();
            this_one.setState({ next_date: next_claim_date });


            // Get the elo
            let elo = response.data.leaderboard.elo;

            // Make array Data
            ronin = ronin.replace("0x", "ronin:")

            let new_data = {
              "name": new_name,
              "ronin": ronin,
              "avg": avg_slp,
              "today_so": today_so,
              "elo": elo,
              "last_claim": last_claimed_date,
              "next_claim": next_claim_date,
              "unclaimed": unclaimed,
              "ronin_slp": claimed,
              "scholar": scholar,
              "manager": manager,
              "total": total_one,
              "percent_manager": percent_manager
            };
            this_one.setState(state => {
              const data = state.data.concat(new_data);
              return { data };
            });

            // Total object for all values
            let new_total = {
              "avg": real_avg_slp,
              "tot_avg": tot_avg_slp,
              "today_so": tot_today_so,
              "unclaimed": tot_unclaimed,
              "ronin_slp": tot_claimed,
              "scholar": tot_scholar,
              "manager": tot_manager,
              "total": tot_total_one
            }
            this_one.setState({ all_total: new_total });
            document.getElementById("cover-spin").style.display = "none";
            
            // document.getElementsByClassName("input-header").style.display = "none";
          }
        })
        .catch(function (error) {
          alert("No response!")
          document.getElementById("cover-spin").style.display = "none";
          var elements = document.getElementsByClassName('input-header');
            Array.prototype.slice.call(elements).forEach(function(el) {
              el.value = '';
            });
            [...elements].forEach(el => {
              el.value = '';
          });
          console.log(error);
        });
    }
    else {
      alert("Wrong Input!")
    }
  }

  edit_complete(e) {
    // Validation the input data
    let name = this.state.name_now;
    let ronin = this.state.ronin_now;
    let manager_p = this.state.manager_percent_now;
    let name_state = (name === this.state.data[e].name);
    let ronin_state = (ronin === this.state.data[e].ronin);
    let manager_p_state = (manager_p === this.state.data[e].percent_manager);

    // Validation not changed
    if (name_state && ronin_state && manager_p_state) {
      this.setState({ show: false });
    }
    // Validation empty fields
    else if (name === "" || ronin === "" || manager_p === "") {
      alert("Not allowed the empty input");
    }
    // Validation if changed name is included in name_group(Only name changed)
    else if (!name_state) {
      if (this.state.name_group.includes(name)) {
        alert("This name already exists")
      }
      else {
        if (ronin_state) {
          if (manager_p > 0 && manager_p < 101 && Number.isInteger(Number(manager_p))) {
            alert("Right percent")
            let new_manager = Math.round(this.state.data[e].total * manager_p / 100);
            let new_scholar = this.state.data[e].total - new_manager;
            let new_total = {
              "avg": this.state.all_total.avg,
              "tot_avg": this.state.all_total.tot_avg,
              "today_so": this.state.all_total.today_so,
              "unclaimed": this.state.all_total.unclaimed,
              "ronin_slp": this.state.all_total.ronin_slp,
              "scholar": this.state.all_total.scholar - this.state.data[e].scholar + new_scholar,
              "manager": this.state.all_total.manager - this.state.data[e].manager + new_manager,
              "total": this.state.all_total.total
            }
            this.setState({ all_total: new_total });
            let new_element = {
              "name": name,
              "ronin": this.state.data[e].ronin,
              "avg": this.state.data[e].avg,
              "today_so": this.state.data[e].today_so,
              "elo": this.state.data[e].elo,
              "last_claim": this.state.data[e].last_claim,
              "next_claim": this.state.data[e].next_claim,
              "unclaimed": this.state.data[e].unclaimed,
              "ronin_slp": this.state.data[e].ronin_slp,
              "scholar": new_scholar,
              "manager": new_manager,
              "total": this.state.data[e].total,
              "percent_manager": manager_p
            };
            let new_data = this.state.data;
            new_data[e] = new_element;

            let name_group = this.state.name_group;
            name_group[e] = name;
            this.setState({ data: new_data, name_group: name_group, show: false });
          }
          else {
            alert("Wrong percent")
          }
        }
        else {
          // Validation ronin address
          let n = ronin.search(/ronin:/i);
          if (n !== 0 || ronin.length !== 46) {
            alert("Wrong ronin address")
          }
          else {
            if (this.state.ronin_address_group.includes(ronin)) {
              alert("This ronin address already exists")
            }
            else {
              // Validation percent range

              if (manager_p > 0 && manager_p < 101 && Number.isInteger(Number(manager_p))) {
                alert("Right percent");
                ronin = ronin.replace("ronin:", "0x");
                let this_one = this;
                let scholar_count = this.state.scholar_count;
                axios
                  .get('https://api.axie.management/v1/overview/' + ronin)
                  .then(function (response) {
                    if (response.data.slp.lastClaimedItemAt === 0) {
                      alert("Wrong input data! Try again")
                    }
                    else {
                      // Add name to the name_group
                      let name_group = this_one.state.name_group;
                      name_group[e] = name;
                      this_one.setState({ name_group: name_group });

                      // Add ronin_address to the ronin_address_group
                      ronin = ronin.replace("0x", "ronin:")
                      let ronin_address_group = this_one.state.ronin_address_group;
                      ronin_address_group[e] = ronin;
                      this_one.setState({ ronin_address_group: ronin_address_group });

                      // Calculate total slp
                      let total_one = response.data.slp.total;
                      let tot_total_one = this_one.state.all_total.total - this_one.state.data[e].total + total_one;

                      // Calculate claimed slp
                      let claimed = response.data.slp.claimableTotal;
                      let tot_claimed = this_one.state.all_total.ronin_slp - this_one.state.data[e].ronin_slp + claimed;

                      // Calculate unclaimed slp
                      let unclaimed = total_one - claimed;
                      let tot_unclaimed = this_one.state.all_total.unclaimed - this_one.state.data[e].unclaimed + unclaimed;

                      // Calculate the last claimed date
                      let timestamp = response.data.slp.lastClaimedItemAt;
                      let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                      let today = new Date();
                      let last_date = new Date(timestamp * 1000);
                      let last_claimed_date = last_date.toLocaleDateString();

                      // Calculate average slp 
                      let diffDays = Math.ceil(Math.abs((today - last_date + 1) / oneDay));
                      let avg_slp = Math.floor(unclaimed / diffDays);
                      let tot_avg_slp = this_one.state.all_total.tot_avg - this_one.state.data[e].avg + avg_slp;
                      let real_avg_slp = Math.floor(tot_avg_slp / scholar_count);

                      // Calculate manager
                      let manager = Math.round(total_one / 100 * manager_p);
                      let tot_manager = this_one.state.all_total.manager - this_one.state.data[e].manager + manager;

                      // Calculate scholar
                      let scholar = total_one - manager;
                      let tot_scholar = this_one.state.all_total.scholar - this_one.state.data[e].scholar + scholar;

                      // Calculate today so far 
                      // if today so far is null, return "no result"
                      let today_so = response.data.slp.todaySoFar;
                      let tot_today_so = this_one.state.all_total.today_so - this_one.state.data[e].today_so + today_so;

                      // Calculate the next claim date
                      let next_date_ready = new Date(last_date.setDate(last_date.getDate() + 14));
                      let next_claim_date = next_date_ready.toLocaleDateString();


                      // Get the elo
                      let elo = response.data.leaderboard.elo;

                      // Make array Data

                      let new_data = {
                        "name": name,
                        "ronin": ronin,
                        "avg": avg_slp,
                        "today_so": today_so,
                        "elo": elo,
                        "last_claim": last_claimed_date,
                        "next_claim": next_claim_date,
                        "unclaimed": unclaimed,
                        "ronin_slp": claimed,
                        "scholar": scholar,
                        "manager": manager,
                        "total": total_one,
                        "percent_manager": manager_p
                      };
                      let last_data = this_one.state.data;
                      last_data[e] = new_data;
                      this_one.setState({ data: last_data });

                      // Total object for all values
                      let new_total = {
                        "avg": real_avg_slp,
                        "tot_avg": tot_avg_slp,
                        "today_so": tot_today_so,
                        "unclaimed": tot_unclaimed,
                        "ronin_slp": tot_claimed,
                        "scholar": tot_scholar,
                        "manager": tot_manager,
                        "total": tot_total_one
                      }
                      this_one.setState({ all_total: new_total });
                    }
                  })
                  .catch(function (error) {
                    console.log(error);
                  });
              }
              else {
                alert("Wrong percent")
              }
            }
          }
        }
      }
    }
    else {
      if (ronin_state) {
        if (manager_p > 0 && manager_p < 101 && Number.isInteger(Number(manager_p))) {
          alert("Right percent")
          let new_manager = Math.round(this.state.data[e].total * manager_p / 100);
          let new_scholar = this.state.data[e].total - new_manager;
          let new_total = {
            "avg": this.state.all_total.avg,
            "tot_avg": this.state.all_total.tot_avg,
            "today_so": this.state.all_total.today_so,
            "unclaimed": this.state.all_total.unclaimed,
            "ronin_slp": this.state.all_total.ronin_slp,
            "scholar": this.state.all_total.scholar - this.state.data[e].scholar + new_scholar,
            "manager": this.state.all_total.manager - this.state.data[e].manager + new_manager,
            "total": this.state.all_total.total
          }
          this.setState({ all_total: new_total });
          let new_element = {
            "name": name,
            "ronin": this.state.data[e].ronin,
            "avg": this.state.data[e].avg,
            "today_so": this.state.data[e].today_so,
            "elo": this.state.data[e].elo,
            "last_claim": this.state.data[e].last_claim,
            "next_claim": this.state.data[e].next_claim,
            "unclaimed": this.state.data[e].unclaimed,
            "ronin_slp": this.state.data[e].ronin_slp,
            "scholar": new_scholar,
            "manager": new_manager,
            "total": this.state.data[e].total,
            "percent_manager": manager_p
          };
          let new_data = this.state.data;
          new_data[e] = new_element;

          let name_group = this.state.name_group;
          name_group[e] = name;
          this.setState({ data: new_data, name_group: name_group, show: false });
        }
        else {
          alert("Wrong percent")
        }
      }
      else {
        // Validation ronin address
        let n = ronin.search(/ronin:/i);
        if (n !== 0 || ronin.length !== 46) {
          alert("Wrong ronin address")
        }
        else {
          if (this.state.ronin_address_group.includes(ronin)) {
            alert("This ronin address already exists")
          }
          else {
            // Validation percent range

            if (manager_p > 0 && manager_p < 101 && Number.isInteger(Number(manager_p))) {
              alert("Right percent");
              ronin = ronin.replace("ronin:", "0x");
              let this_one = this;
              let scholar_count = this.state.scholar_count;
              axios
                .get('https://api.axie.management/v1/overview/' + ronin)
                .then(function (response) {
                  if (response.data.slp.lastClaimedItemAt === 0) {
                    alert("Wrong input data! Try again")
                  }
                  else {
                    console.log(response.data);
                    // Add name to the name_group
                    let name_group = this_one.state.name_group;
                    name_group[e] = name;
                    this_one.setState({ name_group: name_group });

                    // Add ronin_address to the ronin_address_group
                    ronin = ronin.replace("0x", "ronin:")
                    let ronin_address_group = this_one.state.ronin_address_group;
                    ronin_address_group[e] = ronin;
                    this_one.setState({ ronin_address_group: ronin_address_group });
                    console.log(name_group, ronin_address_group);

                    // Calculate total slp
                    let total_one = response.data.slp.total;
                    let tot_total_one = this_one.state.all_total.total - this_one.state.data[e].total + total_one;

                    // Calculate claimed slp
                    let claimed = response.data.slp.claimableTotal;
                    let tot_claimed = this_one.state.all_total.ronin_slp - this_one.state.data[e].ronin_slp + claimed;

                    // Calculate unclaimed slp
                    let unclaimed = total_one - claimed;
                    let tot_unclaimed = this_one.state.all_total.unclaimed - this_one.state.data[e].unclaimed + unclaimed;

                    // Calculate the last claimed date
                    let timestamp = response.data.slp.lastClaimedItemAt;
                    let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    let today = new Date();
                    let last_date = new Date(timestamp * 1000);
                    let last_claimed_date = last_date.toLocaleDateString();

                    // Calculate average slp 
                    let diffDays = Math.ceil(Math.abs((today - last_date + 1) / oneDay));
                    let avg_slp = Math.floor(unclaimed / diffDays);
                    let tot_avg_slp = this_one.state.all_total.tot_avg - this_one.state.data[e].avg + avg_slp;
                    let real_avg_slp = Math.floor(tot_avg_slp / scholar_count);

                    // Calculate manager
                    let manager = Math.round(total_one / 100 * manager_p);
                    let tot_manager = this_one.state.all_total.manager - this_one.state.data[e].manager + manager;

                    // Calculate scholar
                    let scholar = total_one - manager;
                    let tot_scholar = this_one.state.all_total.scholar - this_one.state.data[e].scholar + scholar;

                    // Calculate today so far 
                    // if today so far is null, return "no result"
                    let today_so = response.data.slp.todaySoFar;
                    let tot_today_so = this_one.state.all_total.today_so - this_one.state.data[e].today_so + today_so;

                    // Calculate the next claim date
                    let next_date_ready = new Date(last_date.setDate(last_date.getDate() + 14));
                    let next_claim_date = next_date_ready.toLocaleDateString();


                    // Get the elo
                    let elo = response.data.leaderboard.elo;

                    // Make array Data

                    let new_data = {
                      "name": name,
                      "ronin": ronin,
                      "avg": avg_slp,
                      "today_so": today_so,
                      "elo": elo,
                      "last_claim": last_claimed_date,
                      "next_claim": next_claim_date,
                      "unclaimed": unclaimed,
                      "ronin_slp": claimed,
                      "scholar": scholar,
                      "manager": manager,
                      "total": total_one,
                      "percent_manager": manager_p
                    };
                    let last_data = this_one.state.data;
                    last_data[e] = new_data;
                    this_one.setState({ data: last_data });

                    // Total object for all values
                    let new_total = {
                      "avg": real_avg_slp,
                      "tot_avg": tot_avg_slp,
                      "today_so": tot_today_so,
                      "unclaimed": tot_unclaimed,
                      "ronin_slp": tot_claimed,
                      "scholar": tot_scholar,
                      "manager": tot_manager,
                      "total": tot_total_one
                    }
                    this_one.setState({ all_total: new_total });
                  }
                })
                .catch(function (error) {
                  console.log(error);
                });
            }
            else {
              alert("Wrong percent")
            }
          }
        }
      }
    }
  }
  edit_one(e) {
    this.setState({ show: true });
    this.setState({ index_now: e })
    this.setState({
      name_now: this.state.data[e].name,
      ronin_now: this.state.data[e].ronin,
      manager_percent_now: this.state.data[e].percent_manager
    });
  }
  delete_one(e) {
    // Catch the whole data from state
    let data = this.state.data;

    // Catch ronin_address_group, name_group and Update them
    let ronin_address_group = this.state.ronin_address_group;
    ronin_address_group.splice(e, 1);
    this.setState({ ronin_address_group: ronin_address_group });

    let name_group = this.state.name_group;
    name_group.splice(e, 1);
    this.setState({ name_group: name_group });


    // Catch the data of total values  from state
    let all_total = this.state.all_total;

    // Catch scholar count
    let scholar_count = this.state.scholar_count;

    // Calculate the avg_slp

    let tot_avg = this.state.all_total.tot_avg - data[e].avg;
    let avg;
    if (scholar_count !== 1) {
      avg = Math.floor(tot_avg / (scholar_count - 1));
    }
    else {
      avg = 0
    }

    // Update state the data of total values
    let new_total = {
      "avg": avg,
      "tot_avg": tot_avg,
      "today_so": all_total.today_so - data[e].today_so,
      "unclaimed": all_total.unclaimed - data[e].unclaimed,
      "ronin_slp": all_total.ronin_slp - data[e].ronin_slp,
      "scholar": all_total.scholar - data[e].scholar,
      "manager": all_total.manager - data[e].manager,
      "total": all_total.total - data[e].total
    }
    this.setState({ all_total: new_total });

    // Delete selected account from the data
    data.splice(e, 1);

    // Set scholar_count and Update whole data
    this.setState({ scholar_count: scholar_count - 1 });
    this.setState({ data: data });
  }
  render() {
    const table_data = this.state.data.map((anObjectMapped, index) => {
      return (
        <tr key={index}>
          <td>{anObjectMapped.name}</td>
          <td>{anObjectMapped.avg}</td>
          <td>{anObjectMapped.today_so}</td>
          <td>{anObjectMapped.elo}</td>
          <td>{anObjectMapped.last_claim}</td>
          <td>{anObjectMapped.next_claim}</td>
          <td>{anObjectMapped.unclaimed}</td>
          <td>{anObjectMapped.ronin_slp}</td>
          <td>{anObjectMapped.scholar}</td>
          <td>{anObjectMapped.manager}</td>
          <td>{anObjectMapped.total}</td>
          <td className="row m-0 pl-2">
            <span className="col-md-6" onClick={() => this.edit_one(index)}><i className="fas fa-edit"></i></span>
            <span className="col-md-6" onClick={() => this.delete_one(index)}><i className="fas fa-trash"></i></span>
          </td>
        </tr>
      );
    })
    return (
      <>
        <Navbar id="navbar-main" >
          <Container>
            <div className="navbar-search navbar-search-dark form-inline mr-3 d-none d-flex w-100">
              <div className="mb-0 w-20">
                <Button className="w-15 mr-5" color="white" onClick={() => this.get_ronin()}>
                  Add Scholar
                </Button>
              </div>
              <div className="mb-0 w-75"  >
                <div className="mb-0 w-100 d-flex">
                  <div className="mb-0 w-30">
                    <InputGroup className="input-group-alternative w-100 pl-4">
                      <Input placeholder="Name" type="text" onChange={this.handleName}
                        className="input-header" />
                    </InputGroup>
                  </div>
                  <div className="mb-0 w-50 ml-5">
                    <InputGroup className="input-group-alternative w-80 pl-4" >
                      <Input placeholder="Manager percentage" className="input-header"
                        type="number" max={100} min={1} onChange={this.handleScholar} />
                    </InputGroup>
                  </div>
                </div>
                <div className="mb-0 w-80 mt-2">
                  <InputGroup className="input-group-alternative w-100 pl-4" >
                    <Input placeholder="Search" type="text" onChange={this.handleChange}
                      className="input-header" />
                  </InputGroup>
                </div>
              </div>
            </div>
          </Container>
        </Navbar>
        <div className="header pt-4" style={{ minHeight: "84vh" }}>
          <Container fluid>
            <div className="header-body">
              <Row>
                <Col lg="6" md="6" sm="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Ronin account
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.ronin_slp}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                            <i className="fas fa-wallet" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Unclaimed SLP
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.unclaimed}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                            <i className="fas fa-unlock-alt" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Total SLP
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.total}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                            <i className="fas fa-balance-scale" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3" >
                  <Card className="card-stats mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Manager
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.manager}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-teal text-white rounded-circle shadow">
                            <i className="fas fa-user-cog" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3" className="mt-3">
                  <Card className="card-stats mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Scholar
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.scholar}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-darker text-white rounded-circle shadow">
                            <i className="fas fa-user-graduate" />
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3" className="mt-3">
                  <Card className="card-stats mb-4 mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Average SLP
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.avg}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-gray text-white rounded-circle shadow">
                            <i className="fas fa-chart-bar"></i>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
                <Col lg="6" md="6" sm="6" xl="3" className="mt-3">
                  <Card className="card-stats mb-xl-0">
                    <CardBody>
                      <Row>
                        <div className="col">
                          <CardTitle
                            tag="h4"
                            className="text-uppercase text-muted mb-0"
                          >
                            Today so far
                          </CardTitle>
                          <span className="h1 font-weight-bold mb-0">
                            {this.state.all_total.today_so}
                          </span>
                        </div>
                        <Col className="col-auto">
                          <div className="icon icon-shape bg-green text-white rounded-circle shadow">
                            <i className="fas fa-calendar-alt"></i>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          </Container>
          <Container className="mt-3" fluid>
            {/* Table */}
            <Row>
              <div className="col">
                <Card className="shadow">
                  <CardHeader className="border-0">
                    <h3 className="mb-0">My Scholars</h3>
                  </CardHeader>
                  <Table className="align-items-center table-flush" responsive>
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">AVG</th>
                        <th scope="col">Today SLP</th>
                        <th scope="col">Elo</th>
                        <th scope="col">Last claim</th>
                        <th scope="col">Next claim</th>
                        <th scope="col">Unclaimed</th>
                        <th scope="col">Ronin SLP</th>
                        <th scope="col">Scholar</th>
                        <th scope="col">Manager</th>
                        <th scope="col">Total</th>
                        <th scope="col">Manage</th>
                      </tr>
                    </thead>
                    {this.state.scholar_count === 0 ?
                      <tbody>
                        <tr>
                          <td colSpan="12" className="pl-6">
                            <h4 className="text-blue m-0">
                              No accounts added. Please add a new scholar to this site
                            </h4>
                          </td>
                        </tr>
                      </tbody> : <tbody>{table_data}</tbody>
                    }
                  </Table>
                  <CardFooter className="py-4">
                  </CardFooter>
                </Card>
              </div>
            </Row>
            <Modal isOpen={this.state.show}
              style={customStyles}
            >
              <span className="text-white" onClick={() => this.setState({ show: false })} style={{ float: "right" }}>
                <i className="fas fa-times-circle fa-lg"></i>
              </span>
              <h3 className="text-white mt-4">Scholar name or account name</h3>
              <Input type="text" className="input-modal" value={this.state.name_now} onChange={this.cg_name} />
              <h3 className="text-white mt-3">Public ronin address with prefix ronin</h3>
              <Input type="text" className="input-modal" value={this.state.ronin_now} onChange={this.cg_ronin} />
              <h3 className="text-white mt-3">Manager percentage</h3>
              <Input type="number" max={100} min={1} className="input-modal"
                value={this.state.manager_percent_now} onChange={this.cg_mn_pcent} />
              <center>
                <Button className="mt-4" onClick={() => this.edit_complete(this.state.index_now)}>
                  <span className="m-2 close-span">
                    <i className="fas fa-save fa-lg"></i>
                  </span>
                  Add account
                </Button>
              </center>
            </Modal>
            <div id="cover-spin"></div>
          </Container>
        </div>
      </>
    )
  }
}

export default AdminNavbar;
