
window.onload = function() {
  let running = false;
  let master_kill_switch = false;
  let start_time;

  const user_grouping = {
    impossible: {
      name: 'Defiant',
      limit: 10,
      comeback_chance: .3,
      exploring: {
        did_enjoy: .4,
        becomes_new_interest: 20,
      },
      personal_interests: {
        min: 1,
        range: 2,
        avoids_repition: 5,
        feedback_chance: .6,
      },
    },
    hard: {
      name: 'Hard to Please',
      limit: 10,
      comeback_chance: .3,
      exploring: {
        did_enjoy: .4,
        becomes_new_interest: 15,
      },
      personal_interests: {
        min: 2,
        range: 3,
        avoids_repition: 6,
        feedback_chance: .7,
      },
    },
    neutral: {
      name: 'Neutral',
      limit: 20,
      comeback_chance: .5,
      exploring: {
        did_enjoy: .4,
        becomes_new_interest: 13,
      },
      personal_interests: {
        min: 3,
        range: 4,
        avoids_repition: 8,
        feedback_chance: .7,
      },
    },
    easy: {
      name: 'Easy to Please',
      limit: 30,
      comeback_chance: .8,
      exploring: {
        did_enjoy: .5,
        becomes_new_interest: 10,
      },
      personal_interests: {
        min: 3,
        range: 5,
        avoids_repition: 10,
        feedback_chance: .9,
      },
    },
    exploring: {
      name: 'Exploring',
      limit: 50,
      comeback_chance: .7,
      exploring: {
        did_enjoy: .6,
        becomes_new_interest: 10,
      },
      personal_interests: {
        min: 4,
        range: 7,
        avoids_repition: 6,
        feedback_chance: 1,
      },
    },
    total: {
      name: 'Overall',
    },
  };
  const hard_values = {
    possible_interests: 100,
    user_limits: {
      memory_limit: 15,
      max_posts: 199,
      simulate: 1000,
    },
    learning: {
      iterations: 300,
      tuneable_steps: 50,
      minimun_experimentation: .1,
      experimenting_range: .9,
      minimum_required_likes: 1,
      required_likes_range: 6,
    },
    speed: {
      timePerPost: 35,
      timePerTick: 500,
      onLoadTimeout: 100,
    },
  };
  const pull_random_from_interests = function() {
    return Math.random() * hard_values.possible_interests;
    // return hard_values.possible_interests[
    //   Math.floor(Math.random()*hard_values.possible_interests.length)
    // ];
  };

  let reported_data = [];

  function build_chart(organized_data) {

    let required_knowlege_points = new Array(organized_data.length),
        testing_rate_points = new Array(organized_data.length),
        defiant_rate_points = new Array(organized_data.length),
        exploring_rate_points = new Array(organized_data.length),
        neutral_rate_points = new Array(organized_data.length),
        defiant_knowlege_points = new Array(organized_data.length),
        exploring_knowlege_points = new Array(organized_data.length),
        neutral_knowlege_points = new Array(organized_data.length);

    for (let i=0;i<organized_data.length;i++) {
      testing_rate_points[i] = {
        x: organized_data[i].knobs.testing_rate,
        y: organized_data[i].data.average,
      };
      defiant_rate_points[i] = {
        x: organized_data[i].knobs.testing_rate,
        y: organized_data[i].data.defiant,
      };
      exploring_rate_points[i] = {
        x: organized_data[i].knobs.testing_rate,
        y: organized_data[i].data.exploring,
      };
      neutral_rate_points[i] = {
        x: organized_data[i].knobs.testing_rate,
        y: organized_data[i].data.neutral,
      };

      required_knowlege_points[i] = {
        x: organized_data[i].knobs.required_likes_before_knows_user,
        y: organized_data[i].data.average,
      };
      defiant_knowlege_points[i] = {
        x: organized_data[i].knobs.required_likes_before_knows_user,
        y: organized_data[i].data.defiant,
      };
      exploring_knowlege_points[i] = {
        x: organized_data[i].knobs.required_likes_before_knows_user,
        y: organized_data[i].data.exploring,
      };
      neutral_knowlege_points[i] = {
        x: organized_data[i].knobs.required_likes_before_knows_user,
        y: organized_data[i].data.neutral,
      };
    }

    let ctx1 = document.getElementById("effectiveness1-chart").getContext('2d');
    let ctx2 = document.getElementById("effectiveness2-chart").getContext('2d');

    let chart_bg_colors = {
      red: [
        'rgba(255, 99, 132, 0.2)',
      ],
      blue: [
        'rgba(0, 0, 255, 0.2)',
      ],
      green: [
        'rgba(0, 255, 0, 0.2)',
      ],
      cyan: [
        'rgba(0, 255, 255, 0.2)',
      ],
    };
    let chart_border_colors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)'
    ];

    new Chart(ctx1, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Average Retention',
          data: testing_rate_points,
          backgroundColor: chart_bg_colors.red,
          borderColor: chart_border_colors,
        }, {
          label: 'Defiant Retention',
          data: defiant_rate_points,
          backgroundColor: chart_bg_colors.blue,
          borderColor: chart_border_colors,
        }, {
          label: 'Exploring Retention',
          data: exploring_rate_points,
          backgroundColor: chart_bg_colors.green,
          borderColor: chart_border_colors,
        }, {
          label: 'Neutral Retention',
          data: neutral_rate_points,
          backgroundColor: chart_bg_colors.cyan,
          borderColor: chart_border_colors,
        }],
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
          }],
        },
      },
    });

    new Chart(ctx2, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Required Knowlege',
          data: required_knowlege_points,
          backgroundColor: chart_bg_colors.red,
          borderColor: chart_border_colors,
        }, {
          label: 'Defiant Knowlege',
          data: defiant_knowlege_points,
          backgroundColor: chart_bg_colors.blue,
          borderColor: chart_border_colors,
        }, {
          label: 'Exploring Knowlege',
          data: exploring_knowlege_points,
          backgroundColor: chart_bg_colors.green,
          borderColor: chart_border_colors,
        }, {
          label: 'Neutral Knowlege',
          data: neutral_knowlege_points,
          backgroundColor: chart_bg_colors.cyan,
          borderColor: chart_border_colors,
        }],
      },
      options: {
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'bottom',
          }],
        },
      },
    });
  }

  function learning_algorithm(learning, report_analysis) {

    let outputs = {};
    let dataset = {};
    for (let x in user_grouping) {
      dataset[x] = {
        retention: 0,
        min: 0,
        max: 0,
        average: 0,
        progress: 0,
      };
      outputs[x] = {
        retention: document.getElementById(`data-${x}-retention`),
        min: document.getElementById(`data-${x}-min`),
        max: document.getElementById(`data-${x}-max`),
        average: document.getElementById(`data-${x}-average`),
        progress: document.getElementById(`data-${x}-progress`),
      };
    }

    let user_tracker = [];
    function calculate_data() {
      let totals = {
        retention: 0,
        min: 100000,
        max: 0,
        average: 0,
        progress: 0,
      };

      for (let x in user_tracker) {
        let min = user_tracker[x][0].views;
        let max = min;
        let total = min;

        for (let i=1;i<user_tracker[x].length;i++) {
          total += user_tracker[x][i].views;

          if (user_tracker[x][i].views < min) {
            min = user_tracker[x][i].views;
          }
          else if (user_tracker[x][i].views > max) {
            max = user_tracker[x][i].views;
          }
        }

        dataset[x].min = min;
        dataset[x].max = max;
        dataset[x].average = Math.floor(total / user_tracker[x].length * 100) / 100;

        totals.retention += total;
        if (total < totals.min) {
          totals.min = total;
        }
        else if (total > totals.max) {
          totals.max = total;
        }
        totals.average += user_tracker[x].length;
        totals.progress += dataset[x].progress;
      }

      dataset['total'].retention = totals.retention;
      dataset['total'].min = totals.min;
      dataset['total'].max = totals.max;
      dataset['total'].average = Math.floor(totals.retention / totals.average * 100) / 100;
      dataset['total'].progress = totals.progress;
    }
    function reflow() {
      calculate_data();

      let stop_flow = true;

      for (let x in outputs) {

        for (let y in outputs[x]) {
          outputs[x][y].innerHTML = dataset[x][y];
        }

        if (!stop_flow) continue;
        if (dataset[x].progress!=0) stop_flow = false;
      }

      if (stop_flow) {
        report_analysis(dataset);
        return
      };

      setTimeout(function() {
        reflow();
      }, hard_values.speed.timePerTick);
    }

      //***  CLASSES **/
    const post_class = function(user, content) {
      let self = this;

      this.content = content;
      this.user = user;
    };

    const app_engine = function(interests) {
      let self = this;

      let liked = [];
      let attempted = [];

      self.add_to_liked = function(post) {
        liked.push(post);
      };

      function is_liked(content) {
        for (let i=0;i<liked.length;i++) {
          if (liked[i].content==content) return true;
        }
        return false;
      }
      function try_to_learn() {
        let try_new, stop_infinite_loop = 0;

        do {
          try_new = pull_random_from_interests();
        } while (is_liked(try_new) && stop_infinite_loop++<100);

        return try_new;
      }

      function find_probabilities() {
        let list = [];
        let highest_in_the_room = [];

        for (let i=0;i<liked.length;i++) {
          if (list.includes(liked[i].content)) {
            highest_in_the_room[list.indexOf(liked[i].content)]++;
            continue;
          }

          list.push(liked[i].content);
          highest_in_the_room.push(0);
        }

        let probabilities = new Array(list.length);

        for (let i=0;i<probabilities.length;i++) {
          probabilities[i] = {
            value: list[i],
            amount: highest_in_the_room[i],
          };
        }

        probabilities.sort(function(a, b){return a.amount - b.amount}).reverse();

        return probabilities;
      }
      function pick_best_choice() {
        let list = find_probabilities();

        if (list.length==0) return try_to_learn();

        return list[Math.floor(Math.random()*Math.min(list.length, 3))].value;
      }

      function get_suggested_content_type() {
        if (liked.length <= learning.required_likes_before_knows_user) {
          return try_to_learn();
        }
        if (learning.testing_rate >= Math.random()) {
          return try_to_learn();
        }
        return pick_best_choice();
      }
      function get_suggested_user() {
        return 'user';
      }

      self.view_next_post = function(interests) {
        let post = new post_class(
          get_suggested_user(),
          get_suggested_content_type(),
        );

        attempted.push(post);

        return post;
      };

      self.output = function() {
        let str = 'liked: {';

        for (let i=0;i<liked.length;i++) {
          str += liked[i].content + ', ';
        }

        str += '}, attempted: {';

        for (let i=0;i<attempted.length;i++) {
          str += attempted[i].content + ', ';
        }

        return str + '}';
      };
    };

    const interests_engine = function(type) {
      let self = this;

      let interest_types = new Array(
        Math.floor(Math.random() * user_grouping[type].personal_interests.range)
              + user_grouping[type].personal_interests.min
      );
      let considering = [];

      for (let i=0;i<interest_types.length;i++) {
        interest_types[i] = pull_random_from_interests();
      }

      self.does_like_post = function(post) {
        return interest_types.includes(post.content);
      };

      self.consider_new_content = function(content) {
        if (considering[content]==null) {
          considering[content] = 0;
        }
        else considering[content]++;

        if (considering[content] >=
          user_grouping[type].exploring.becomes_new_interest)
                interest_types.push(content);
      };

      self.output = function() {
        return interest_types;
      };
    };

    const person_engine = function(type, index) {
      let self = this;

      const interests = new interests_engine(type);
      const app = new app_engine(interests);
      user_tracker[type].push(self);

      let memory = [];

      let disliked_posts = 0;
      self.left_app = false;
      self.views = 0;

      self.view_and_act = function() {
        report();

        view_post(app.view_next_post(interests));

        if (!self.left_app && self.views > hard_values.user_limits.max_posts) close();
      };

      function report() {
        dataset[type].retention++;
        self.views++;
      }
      function close() {
        self.left_app = true;
        dataset[type].progress--;
      }
      function view_post(post) {
        if (did_enjoy_post(post)) {
          if (Math.random() < user_grouping[type].personal_interests.feedback_chance) {
            like_post(post);
          }
        }
        else if (Math.random() <= user_grouping[type].exploring.did_enjoy) {
          like_post(post);
          interests.consider_new_content(post.content);
        }
        else if (++disliked_posts > user_grouping[type].limit) {
          close();
          return;
        }

        if (memory.length > hard_values.user_limits.memory_limit) {
          memory.shift();
        }

        let similar_types = 0;
        for (let i=0;i<memory.length;i++) {
          if (memory[i].content==post.content) {
            similar_types++;

            if (similar_types >= user_grouping[type].personal_interests.avoids_repition) {
              close();
              return;
            }
          }
        }

        memory.push(post);
      }
      function did_enjoy_post(post) {
        return interests.does_like_post(post);
      }
      function like_post(post) {
        app.add_to_liked(post);
      }

      dataset[type].progress++;
    };
      //***  END CLASSES **/

      //***  ENVIORNMENT **/
    const similar_personalities = function() {

    };
      //***  END ENVIORNMENT **/

    const users = hard_values.user_limits.simulate;

    function iterator(person) {
      setTimeout(function() {
        if (person.left_app) return;

        person.view_and_act();

        iterator(person);
      }, hard_values.speed.timePerPost);
    }

    for (let x in dataset) {
      if (x=='total') continue;

      user_tracker[x] = [];

      for (let i=0;i<users;i++) {
        iterator(new person_engine(x, i));
      }
    }

    reflow();
  }

  function learn_and_adjust(learning, index) {
    if (index >= hard_values.learning.iterations || master_kill_switch) {
      running = false;
      document.getElementById('rerun').style.display = 'block';
      document.getElementById('test-stop-button').style.display = 'none';
      let end_time = new Date;
      console.log('Time took: ' + (end_time - start_time));

      reported_data.sort(function(a, b){return a.data.average - b.data.average}).reverse();

      console.log(reported_data);
      return;
    }

    learning_algorithm({
      testing_rate: learning.testing_rate,
      required_likes_before_knows_user: learning.required_likes_before_knows_user,
    }, function(data) {

      console.log('in progress', (index + 1) / hard_values.learning.iterations * 100, '%');

      reported_data.push({
        knobs: learning,
        data: {
          retention: data.total.retention,
          min: data.total.min,
          max: data.total.max,
          average: data.total.average,
          defiant: data.impossible.average,
          exploring: data.exploring.average,
          neutral: data.neutral.average,
        },
      });

      build_chart(reported_data);

      let new_tuning = {
        steps: learning.fine_tuning_value.steps,
        range: learning.fine_tuning_value.range,
        guesses: learning.fine_tuning_value.guesses,
      };

      if (index != 0)
      if (index % learning.fine_tuning_value.steps == 0) {
        new_tuning.range -= (new_tuning.range / 4);

        reported_data.sort(function(a, b){return a.data.average - b.data.average}).reverse();

        new_tuning.guesses = {
          testing_rate: reported_data[0].knobs.testing_rate,
          required: reported_data[0].knobs.required_likes_before_knows_user,
        };
      }

      learn_and_adjust({
        testing_rate:
          Math.max(hard_values.learning.minimun_experimentation,
          Math.min(hard_values.learning.experimenting_range +
            hard_values.learning.minimun_experimentation,
                    new_tuning.guesses.testing_rate +
                        (new_tuning.range * ((Math.random() - .5) *
                        hard_values.learning.experimenting_range))
              )),
        required_likes_before_knows_user:
          Math.max(hard_values.learning.minimum_required_likes,
          Math.min(hard_values.learning.required_likes_range +
            hard_values.learning.minimum_required_likes,
                    new_tuning.guesses.required +
                        (new_tuning.range * ((Math.random() - .5) *
                        hard_values.learning.required_likes_range))
              )),
        fine_tuning_value: new_tuning,
      }, index + 1);
    });
  }

  function machine_learning() {
    if (running) return;
    master_kill_switch = false;
    running = true;
    document.getElementById('rerun').style.display = 'none';
    document.getElementById('test-stop-button').style.display = 'block';
    start_time = new Date;

    learn_and_adjust({
      testing_rate: Math.random(),
      required_likes_before_knows_user: Math.floor(Math.random() * hard_values.learning.required_likes_range),
      fine_tuning_value: {
        steps: hard_values.learning.iterations / hard_values.learning.tuneable_steps,
        range: 1,
        guesses: {
          testing_rate: (hard_values.learning.experimenting_range / 2) + hard_values.learning.minimun_experimentation,
          required: (hard_values.learning.required_likes_range / 2) + hard_values.learning.minimum_required_likes,
        },
      },
    }, 0);
  }

  function kill_all_flow() {
    master_kill_switch = true;
  }

  document.getElementById('rerun').onclick = function() {
    machine_learning();
  };
  document.getElementById('test-stop-button').onclick = function() {
    kill_all_flow();
  };

  const titles = document.getElementById('titles');
  const data_entry = document.getElementById('data-entry');

  for (let x in user_grouping) {
    let container = document.createElement('div');
    container.className = 'w3-padding';

    let card = document.createElement('div');
    card.className = 'w3-card ar-pallette-blue';
    card.innerHTML = user_grouping[x].name;

    container.appendChild(card);
    titles.appendChild(container);

    let data_container = document.createElement('div');

    let value_types = ['retention', 'min', 'max', 'average', 'progress'];

    for (let i=0;i<value_types.length;i++) {
      let data_cell = document.createElement('div');
      data_cell.className = "w3-cell w3-padding";

      let data_value = document.createElement('div');
      data_value.id = `data-${x}-${value_types[i]}`;
      data_value.className = 'w3-card ar-cell-w';
      data_value.innerHTML = 'X';

      data_cell.appendChild(data_value);

      data_container.appendChild(data_cell);
    }

    data_entry.appendChild(data_container);
  }

  setTimeout(function() {
    machine_learning();
  }, hard_values.speed.onLoadTimeout);
};
