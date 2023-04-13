import unittest
import requests

"""
TODO: Il faudrait tester aussi le contenu de la requête
"""


class TestAPI(unittest.TestCase):
    def setUp(self):
        self.host_local = "http://localhost:8080/"

        self.nature_mutation_global = self.host_local + "api/global/nature_mutation/"
        self.vente_annee_global = self.host_local + "api/global/vente/"
        self.type_local_global = self.host_local + "api/global/type_local/"
        self.type_local_vendu_par_commune = self.host_local + "api/global/type_local_vendu_par_commune/"
        self.evolution_prix_par_type_local = self.host_local + "api/global/evolution_prix_par_type_local/"

        self.nature_mutation_commune = self.host_local + "api/commune/nature_mutation/97418"
        self.vente_annee_commune = self.host_local + "api/commune/vente/97418"
        self.type_local_commune = self.host_local + "api/commune/type_local/97418"

    # Global
    def test_API_nature_mutation_global(self):
        response = requests.get(self.nature_mutation_global)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement /api/global/nature_mutation")

    def test_API_vente_annee_global(self):
        response = requests.get(self.vente_annee_global)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement api/global/vente")

    def test_API_type_local_global(self):
        response = requests.get(self.type_local_global)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement api/global/type_local")
    
    def test_API_type_local_vendu_par_commune(self):
        response = requests.get(self.type_local_vendu_par_commune)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement /api/global/type_local_vendu_par_commune/")
    
    def test_API_evolution_prix_par_type_local(self):
        response = requests.get(self.evolution_prix_par_type_local)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement api/global/evolution_prix_par_type_local/")

    # Commune
    def test_API_nature_mutation_commune(self):
        response = requests.get(self.nature_mutation_commune)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement /api/commune/nature_mutation/97418")

    def test_API_vente_annee_communel(self):
        response = requests.get(self.vente_annee_commune)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement /api/commune/vente/97418")

    def test_API_type_local_commune(self):
        response = requests.get(self.type_local_commune)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement /api/commune/type_local/97418")


if __name__ == '__main__':
    unittest.main()
