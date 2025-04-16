// controllers/horseController.js
const { Horse } = require("../models/horse");
const mongoose = require("mongoose");

exports.addHorse = async (req, res) => {
  try {
    const {
      matricule,
      name,
      race,
      otherRace,
      birthDate,
      sex,
      robe,
      otherRobe,
      discipline,
      otherDiscipline,
      father,
      fatherText,
      mother,
      motherText,
      Provenance,
      otherProvenance,
      Taille,
      Puce,
      Detachement,
      otherDetachement,
    } = req.body;

    console.log("Request body:", req.body);

    // Validate required fields
    if (!name || !race || !birthDate || !sex || !robe || !discipline) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Handle parent references and text
    const horseData = {
      matricule: !matricule || matricule.trim() === "" ? null : matricule,
      name,
      race,
      otherRace,
      birthDate,
      sex,
      robe,
      otherRobe,
      discipline,
      otherDiscipline,
      Provenance: Provenance === "Autre" ? otherProvenance : Provenance,
      Taille,
      Puce,
      Detachement: Detachement === "Autre" ? otherDetachement : Detachement,
    };

    // Handle father data
    if (mongoose.Types.ObjectId.isValid(father)) {
      horseData.father = father;
    } else if (fatherText) {
      horseData.fatherText = fatherText;
    }

    // Handle mother data
    if (mongoose.Types.ObjectId.isValid(mother)) {
      horseData.mother = mother;
    } else if (motherText) {
      horseData.motherText = motherText;
    }

    // Create and save the horse document
    const newHorse = new Horse(horseData);
    const savedHorse = await newHorse.save();

    // Populate parent references if they exist
    await savedHorse.populate([
      { path: "father", select: "name matricule" },
      { path: "mother", select: "name matricule" },
    ]);

    res.status(201).json({
      success: true,
      data: savedHorse,
    });
  } catch (error) {
    console.error("Error adding horse:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getHorses = async (req, res) => {
  try {
    const search = req.query.search || "";
    const race = req.query.race || "";
    const robe = req.query.robe || "";
    const etat = req.query.etat || "";
    const discipline = req.query.discipline || "";
    const provenance = req.query.provenance || "";
    const detachement = req.query.detachement || "";

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { matricule: { $regex: search, $options: "i" } },
        { fatherText: { $regex: search, $options: "i" } },
        { motherText: { $regex: search, $options: "i" } },
        { Puce: { $regex: search, $options: "i" } },
        { Taille: { $regex: search, $options: "i" } },
      ];
    }

    if (race) query.race = race;
    if (robe) query.robe = robe;
    if (etat) query.etat = etat;
    if (discipline) query.discipline = discipline;
    if (provenance) query.Provenance = provenance;
    if (detachement) query.Detachement = detachement;

    const [
      horses,
      distinctRaces,
      distinctRobes,
      distinctDisciplines,
      distinctProvenances,
      distinctDetachements,
    ] = await Promise.all([
      Horse.find(query)
        .select(
          "name matricule race sex discipline robe birthDate etat father fatherText mother motherText horseId updatedAt Provenance Taille Puce Detachement"
        )
        .populate("father", "name matricule")
        .populate("mother", "name matricule"),
      Horse.distinct("race"),
      Horse.distinct("robe"),
      Horse.distinct("discipline"),
      Horse.distinct("Provenance"),
      Horse.distinct("Detachement"),
    ]);

    // Process parent information for display
    const processedHorses = horses.map((horse) => ({
      ...horse.toObject(),
      fatherInfo: horse.father
        ? { name: horse.father.name, matricule: horse.father.matricule }
        : horse.fatherText
        ? { name: horse.fatherText }
        : null,
      motherInfo: horse.mother
        ? { name: horse.mother.name, matricule: horse.mother.matricule }
        : horse.motherText
        ? { name: horse.motherText }
        : null,
    }));

    const filteredRaces = distinctRaces
      .filter((race) => race && race.trim())
      .sort((a, b) => a.localeCompare(b));

    const filteredRobes = distinctRobes
      .filter((robe) => robe && robe.trim())
      .sort((a, b) => a.localeCompare(b));

    const filteredDisciplines = distinctDisciplines
      .filter((discipline) => discipline && discipline.trim())
      .sort((a, b) => a.localeCompare(b));

    const filteredProvenances = distinctProvenances
      .filter((provenance) => provenance && provenance.trim())
      .sort((a, b) => a.localeCompare(b));

    const filteredDetachements = distinctDetachements
      .filter((detachement) => detachement && detachement.trim())
      .sort((a, b) => a.localeCompare(b));

    console.log(processedHorses);

    res.status(200).json({
      success: true,
      data: processedHorses,
      metadata: {
        races: filteredRaces,
        robes: filteredRobes,
        disciplines: filteredDisciplines,
        provenances: filteredProvenances,
        detachements: filteredDetachements,
        etats: ["sain", "malade", "en rétablissement"],
      },
    });
  } catch (error) {
    console.error("Error fetching horses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.getHorseById = async (req, res) => {
  try {
    console.log("GET request received for horse ID:", req.params.id);

    const horse = await Horse.findById(req.params.id)
      .populate("father", "name matricule")
      .populate("mother", "name matricule");

    if (!horse) {
      console.log("Horse not found");
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Process parent information
    const processedHorse = {
      ...horse.toObject(),
      fatherInfo: horse.father
        ? { name: horse.father.name, matricule: horse.father.matricule }
        : horse.fatherText
        ? { name: horse.fatherText }
        : null,
      motherInfo: horse.mother
        ? { name: horse.mother.name, matricule: horse.mother.matricule }
        : horse.motherText
        ? { name: horse.motherText }
        : null,
    };

    res.json({
      success: true,
      data: processedHorse,
    });
  } catch (error) {
    console.error("Error fetching horse details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateHorseState = async (req, res) => {
  try {
    const { id } = req.params;
    const { etat } = req.body;

    // Validate etat value
    const validEtats = ["malade", "sain", "en rétablissement"];
    if (!validEtats.includes(etat)) {
      return res.status(400).json({
        error: "L'état doit être 'malade', 'sain' ou 'en rétablissement'",
      });
    }

    // Find and update the horse
    const updatedHorse = await Horse.findByIdAndUpdate(
      id,
      { etat },
      { new: true, runValidators: true }
    );

    if (!updatedHorse) {
      return res.status(404).json({
        error: "Cheval non trouvé",
      });
    }

    res.json(updatedHorse);
  } catch (error) {
    console.error("Error updating horse state:", error);
    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'état du cheval",
    });
  }
};

exports.getHorseBasicDetails = async (req, res) => {
  const id = req.params.id;
  console.log("GET request received for horse ID:", id);

  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid horse ID format",
      });
    }

    const horse = await Horse.findById(id)
      .select(
        "name matricule father fatherText mother motherText Provenance Taille Puce Detachement"
      )
      .populate("father", "name matricule")
      .populate("mother", "name matricule");

    if (!horse) {
      return res.status(404).json({
        error: "Horse not found",
      });
    }

    const processedHorse = {
      ...horse.toObject(),
      fatherInfo: horse.father
        ? { name: horse.father.name, matricule: horse.father.matricule }
        : horse.fatherText
        ? { name: horse.fatherText }
        : null,
      motherInfo: horse.mother
        ? { name: horse.mother.name, matricule: horse.mother.matricule }
        : horse.motherText
        ? { name: horse.motherText }
        : null,
    };

    res.json(processedHorse);
  } catch (error) {
    console.error("Error fetching horse:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.getHorsesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let horses = [];

    switch (category) {
      case "maladies": {
        // Get horses currently under treatment
        const horsesWithTests = await Test.aggregate([
          {
            $sort: { date: -1 },
          },
          {
            $group: {
              _id: "$horse",
              lastTest: { $first: "$diagnostiques" },
            },
          },
          {
            $match: {
              lastTest: { $regex: /traitement|maladie/i },
            },
          },
        ]);

        const horseIds = horsesWithTests.map((h) => h._id);
        horses = await Horse.find({
          _id: { $in: horseIds },
        });
        break;
      }

      case "retablissement": {
        // Get horses in recovery
        const horsesWithTests = await Test.aggregate([
          {
            $sort: { date: -1 },
          },
          {
            $group: {
              _id: "$horse",
              lastTest: { $first: "$diagnostiques" },
            },
          },
          {
            $match: {
              lastTest: { $regex: /rétablissement|récupération/i },
            },
          },
        ]);

        const horseIds = horsesWithTests.map((h) => h._id);
        horses = await Horse.find({
          _id: { $in: horseIds },
        });
        break;
      }

      case "sains": {
        // Get healthy horses
        const horsesWithTests = await Test.aggregate([
          {
            $sort: { date: -1 },
          },
          {
            $group: {
              _id: "$horse",
              lastTest: { $first: "$diagnostiques" },
            },
          },
          {
            $match: {
              lastTest: { $regex: /sain|normal/i },
            },
          },
        ]);

        const horseIds = horsesWithTests.map((h) => h._id);
        horses = await Horse.find({
          _id: { $in: horseIds },
        });
        break;
      }

      case "race":
      case "robe":
      case "discipline":
      case "Provenance":
      case "Detachement": {
        // Get horses by specific attribute
        const { value } = req.query;
        if (!value) {
          return res.status(400).json({
            success: false,
            error: "Value parameter is required",
          });
        }
        horses = await Horse.find({ [category]: value });
        break;
      }

      default:
        // Get all horses
        horses = await Horse.find();
    }

    // Process parent information for all horses
    const processedHorses = await Promise.all(
      horses.map(async (horse) => {
        await horse.populate([
          { path: "father", select: "name matricule" },
          { path: "mother", select: "name matricule" },
        ]);

        return {
          ...horse.toObject(),
          fatherInfo: horse.father
            ? { name: horse.father.name, matricule: horse.father.matricule }
            : horse.fatherText
            ? { name: horse.fatherText }
            : null,
          motherInfo: horse.mother
            ? { name: horse.mother.name, matricule: horse.mother.matricule }
            : horse.motherText
            ? { name: horse.motherText }
            : null,
        };
      })
    );

    res.json({
      success: true,
      horses: processedHorses,
    });
  } catch (error) {
    console.error("Error fetching horses:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deleteHorse = async (req, res) => {
  try {
    console.log("DELETE request received for horse ID:", req.params.id);

    const deletedHorse = await Horse.findByIdAndDelete(req.params.id);

    if (!deletedHorse) {
      console.log("Horse not found for deletion");
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    console.log("Horse successfully deleted:", deletedHorse);

    res.status(200).json({
      success: true,
      data: deletedHorse,
    });
  } catch (error) {
    console.error("Error deleting horse:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateHorse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      matricule,
      name,
      race,
      otherRace,
      birthDate,
      sex,
      robe,
      otherRobe,
      discipline,
      otherDiscipline,
      father,
      fatherText,
      mother,
      motherText,
      Provenance,
      otherProvenance,
      Taille,
      Puce,
      Detachement,
      otherDetachement,
    } = req.body;

    // Validate required fields
    if (!name || !race || !birthDate || !sex || !robe || !discipline) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Handle parent references and text
    const horseData = {
      matricule: !matricule || matricule.trim() === "" ? null : matricule,
      name,
      race,
      otherRace,
      birthDate,
      sex,
      robe,
      otherRobe,
      discipline,
      otherDiscipline,
      Provenance: Provenance === "Autre" ? otherProvenance : Provenance,
      Taille,
      Puce,
      Detachement: Detachement === "Autre" ? otherDetachement : Detachement,
    };

    // Handle father data
    if (mongoose.Types.ObjectId.isValid(father)) {
      horseData.father = father;
    } else if (fatherText) {
      horseData.fatherText = fatherText;
    }

    // Handle mother data
    if (mongoose.Types.ObjectId.isValid(mother)) {
      horseData.mother = mother;
    } else if (motherText) {
      horseData.motherText = motherText;
    }

    // Find and update the horse
    const updatedHorse = await Horse.findByIdAndUpdate(id, horseData, {
      new: true,
      runValidators: true,
    });

    if (!updatedHorse) {
      return res.status(404).json({
        success: false,
        error: "Horse not found",
      });
    }

    // Populate parent references if they exist
    await updatedHorse.populate([
      { path: "father", select: "name matricule" },
      { path: "mother", select: "name matricule" },
    ]);

    res.status(200).json({
      success: true,
      data: updatedHorse,
    });
  } catch (error) {
    console.error("Error updating horse:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
