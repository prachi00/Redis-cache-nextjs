import Image from "next/image";
import styles from "../styles/Home.module.css";
import redis from "redis";
import bluebird from "bluebird";

function Home({ dogImages }) {
  return (
    <div className={styles.home}>
      {dogImages.map((url, index) => {
        return (
          <div key={index} className={styles.dogs}>
            <Image
              src={url}
              height="200"
              width="200"
              alt="dogs"
              layout="fixed"
            />
          </div>
        );
      })}
    </div>
  );
}

const fetchData = async (url) => {
  const query = await fetch(url);
  return await query.json();
};

export const getServerSideProps = async () => {
  bluebird.promisifyAll(redis.RedisClient.prototype);
  const cache = redis.createClient();
  let data = {};
  await cache.existsAsync("dogs").then(async (reply) => {
    if (reply !== 1) {
      // cache miss, need to fetch
      data = await fetchData("https://dog.ceo/api/breed/hound/images");
      await cache.set("dogs", JSON.stringify(data));
      console.log("getting dogs from server", data.message);
    } else {
      // cache hit, will get data from redis
      data = JSON.parse(await cache.getAsync("dogs"));
      console.log("getting dogs from redis", data.message);
    }
  });
  return {
    props: {
      dogImages: data.message,
    },
  };
};

export default Home;
