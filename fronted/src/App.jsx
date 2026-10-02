import { Route, Routes } from "react-router-dom";

import Home from "./Pages/Home";
import Explore from "./Pages/Explore";
import Navbar from "./Component/Navbar";
import Mytrip from "./Pages/Mytrip";
import Placemap from "./Pages/Placemap";
import Review from "./Pages/Review";

const App = () => (

  <div>
    <Navbar />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/my-trip" element={<Mytrip />} />
      <Route path="/places/:id/map" element={<Placemap />} />
      <Route path="/review" element={<Review />} />
    </Routes>

  </div>
);

export default App;
