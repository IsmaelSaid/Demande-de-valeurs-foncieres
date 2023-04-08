import unittest
import requests

"""
TODO: Il faudrait tester aussi le contenu de la requpete
"""


class TestAPI(unittest.TestCase):
    def setUp(self):
        self.api_mutations = "https://dvfapp.fly.dev/api/count/mutations/97418"
        self.api_type_local = "https://dvfapp.fly.dev/api/count/typelocal/97418"

    def test_fonctionnement_API_mutations(self):
        response = requests.get(self.api_mutations)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnementapi/count/mutations/:code_insee")

    def test_fonctionnement_API_type_local(self):
        response = requests.get(self.api_type_local)
        self.assertEqual(response.status_code, 200,
                         "Test de bon fonctionnement api/count/typelocal/:code_insee")


if __name__ == '__main__':
    unittest.main()
