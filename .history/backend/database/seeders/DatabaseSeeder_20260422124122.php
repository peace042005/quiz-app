<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Administrateur',
            'email'    => 'admin@quiz.com',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // Joueur test
        User::create([
            'name'     => 'Joueur Test',
            'email'    => 'joueur@quiz.com',
            'password' => Hash::make('password'),
            'role'     => 'user',
        ]);

        // Catégories
        $categories = [
            ['name' => 'Informatique',      'icon' => '💻', 'color' => '#6366f1', 'description' => 'Questions sur la programmation et les technologies'],
            ['name' => 'Culture Générale',  'icon' => '🌍', 'color' => '#10b981', 'description' => 'Questions de culture générale'],
            ['name' => 'Mathématiques',     'icon' => '🔢', 'color' => '#f59e0b', 'description' => 'Questions de maths et logique'],
            ['name' => 'Sciences',          'icon' => '🔬', 'color' => '#ef4444', 'description' => 'Physique, chimie, biologie'],
            ['name' => 'Histoire',          'icon' => '📜', 'color' => '#8b5cf6', 'description' => 'Événements historiques mondiaux'],
        ];

        foreach ($categories as $catData) {
            $category = Category::create([
                'name'        => $catData['name'],
                'slug'        => \Illuminate\Support\Str::slug($catData['name']),
                'description' => $catData['description'],
                'icon'        => $catData['icon'],
                'color'       => $catData['color'],
                'is_active'   => true,
            ]);

            // Questions pour chaque catégorie
            $this->createQuestions($category);
        }
    }

    private function createQuestions($category): void
    {
        $questionsData = $this->getQuestionsFor($category->name);

        foreach ($questionsData as $qData) {
            $question = Question::create([
                'category_id'   => $category->id,
                'question_text' => $qData['question'],
                'difficulty'    => $qData['difficulty'],
                'points'        => $qData['difficulty'] === 'easy' ? 10 : ($qData['difficulty'] === 'medium' ? 20 : 30),
                'time_limit'    => $qData['difficulty'] === 'easy' ? 20 : ($qData['difficulty'] === 'medium' ? 30 : 45),
                'explanation'   => $qData['explanation'] ?? null,
                'is_active'     => true,
            ]);

            foreach ($qData['answers'] as $i => $ans) {
                Answer::create([
                    'question_id' => $question->id,
                    'answer_text' => $ans['text'],
                    'is_correct'  => $ans['correct'],
                    'order'       => $i,
                ]);
            }
        }
    }

    private function getQuestionsFor(string $category): array
    {
        $data = [
            'Informatique' => [
                [
                    'question'   => 'Quel langage est principalement utilisé pour le style des pages web ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'CSS (Cascading Style Sheets) est le langage utilisé pour styliser les pages HTML.',
                    'answers'    => [
                        ['text' => 'CSS',        'correct' => true],
                        ['text' => 'JavaScript', 'correct' => false],
                        ['text' => 'PHP',        'correct' => false],
                        ['text' => 'Python',     'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Que signifie "API" ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'API signifie Application Programming Interface, une interface permettant à des applications de communiquer entre elles.',
                    'answers'    => [
                        ['text' => 'Application Programming Interface', 'correct' => true],
                        ['text' => 'Automated Program Installer',       'correct' => false],
                        ['text' => 'Application Process Integration',   'correct' => false],
                        ['text' => 'Advanced Protocol Interface',       'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quel est le résultat de 2 ** 10 en Python ?',
                    'difficulty' => 'medium',
                    'explanation'=> '2 ** 10 signifie 2 à la puissance 10, soit 1024.',
                    'answers'    => [
                        ['text' => '1024', 'correct' => true],
                        ['text' => '20',   'correct' => false],
                        ['text' => '512',  'correct' => false],
                        ['text' => '2048', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quelle structure de données suit le principe LIFO ?',
                    'difficulty' => 'medium',
                    'explanation'=> 'La pile (Stack) suit le principe Last In, First Out (LIFO) — le dernier élément entré est le premier sorti.',
                    'answers'    => [
                        ['text' => 'Pile (Stack)',  'correct' => true],
                        ['text' => 'File (Queue)', 'correct' => false],
                        ['text' => 'Tableau',      'correct' => false],
                        ['text' => 'Arbre',        'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Qu\'est-ce que la complexité temporelle O(log n) ?',
                    'difficulty' => 'hard',
                    'explanation'=> 'O(log n) représente une complexité logarithmique — typique de la recherche binaire. Le temps d\'exécution croît logarithmiquement avec la taille des données.',
                    'answers'    => [
                        ['text' => 'Logarithmique — croît lentement même pour de grandes données', 'correct' => true],
                        ['text' => 'Linéaire — proportionnel à n',                                 'correct' => false],
                        ['text' => 'Quadratique — proportionnel à n²',                             'correct' => false],
                        ['text' => 'Constante — toujours le même temps',                           'correct' => false],
                    ],
                ],
            ],
            'Culture Générale' => [
                [
                    'question'   => 'Quelle est la capitale de la France ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'Paris est la capitale et la plus grande ville de France.',
                    'answers'    => [
                        ['text' => 'Paris',  'correct' => true],
                        ['text' => 'Lyon',   'correct' => false],
                        ['text' => 'Nantes', 'correct' => false],
                        ['text' => 'Bordeaux','correct' => false],
                    ],
                ],
                [
                    'question'   => 'Combien de continents y a-t-il sur Terre ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'Il y a 7 continents : Afrique, Antarctique, Asie, Europe, Amérique du Nord, Océanie, Amérique du Sud.',
                    'answers'    => [
                        ['text' => '7', 'correct' => true],
                        ['text' => '5', 'correct' => false],
                        ['text' => '6', 'correct' => false],
                        ['text' => '8', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quel pays est le plus grand du monde en superficie ?',
                    'difficulty' => 'medium',
                    'explanation'=> 'La Russie est le plus grand pays du monde avec environ 17,1 millions de km².',
                    'answers'    => [
                        ['text' => 'Russie',        'correct' => true],
                        ['text' => 'Canada',        'correct' => false],
                        ['text' => 'États-Unis',    'correct' => false],
                        ['text' => 'Chine',         'correct' => false],
                    ],
                ],
            ],
            'Mathématiques' => [
                [
                    'question'   => 'Quelle est la valeur de π (pi) approximativement ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'π ≈ 3,14159... C\'est le rapport entre la circonférence d\'un cercle et son diamètre.',
                    'answers'    => [
                        ['text' => '3,14159', 'correct' => true],
                        ['text' => '3,12345', 'correct' => false],
                        ['text' => '2,71828', 'correct' => false],
                        ['text' => '1,41421', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quelle est la racine carrée de 144 ?',
                    'difficulty' => 'easy',
                    'explanation'=> '√144 = 12, car 12 × 12 = 144.',
                    'answers'    => [
                        ['text' => '12', 'correct' => true],
                        ['text' => '14', 'correct' => false],
                        ['text' => '11', 'correct' => false],
                        ['text' => '13', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Combien y a-t-il de degrés dans un triangle ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'La somme des angles intérieurs d\'un triangle est toujours 180°.',
                    'answers'    => [
                        ['text' => '180°', 'correct' => true],
                        ['text' => '90°',  'correct' => false],
                        ['text' => '360°', 'correct' => false],
                        ['text' => '270°', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quelle est la suite de Fibonacci après 13 ?',
                    'difficulty' => 'medium',
                    'explanation'=> 'La suite de Fibonacci : 0, 1, 1, 2, 3, 5, 8, 13, 21... Chaque terme est la somme des deux précédents.',
                    'answers'    => [
                        ['text' => '21', 'correct' => true],
                        ['text' => '18', 'correct' => false],
                        ['text' => '26', 'correct' => false],
                        ['text' => '15', 'correct' => false],
                    ],
                ],
            ],
            'Sciences' => [
                [
                    'question'   => 'Quelle est la formule chimique de l\'eau ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'L\'eau est composée de 2 atomes d\'hydrogène et 1 atome d\'oxygène : H₂O.',
                    'answers'    => [
                        ['text' => 'H₂O',  'correct' => true],
                        ['text' => 'CO₂',  'correct' => false],
                        ['text' => 'NaCl', 'correct' => false],
                        ['text' => 'O₂',   'correct' => false],
                    ],
                ],
                [
                    'question'   => 'À quelle vitesse se déplace la lumière dans le vide ?',
                    'difficulty' => 'medium',
                    'explanation'=> 'La lumière se déplace à environ 299 792 458 m/s dans le vide, soit ≈ 300 000 km/s.',
                    'answers'    => [
                        ['text' => '300 000 km/s',  'correct' => true],
                        ['text' => '150 000 km/s',  'correct' => false],
                        ['text' => '1 000 000 km/s','correct' => false],
                        ['text' => '30 000 km/s',   'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Quel est le symbole chimique du fer ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'Le symbole chimique du fer est Fe, du latin "Ferrum".',
                    'answers'    => [
                        ['text' => 'Fe', 'correct' => true],
                        ['text' => 'Fr', 'correct' => false],
                        ['text' => 'Fi', 'correct' => false],
                        ['text' => 'Ir', 'correct' => false],
                    ],
                ],
            ],
            'Histoire' => [
                [
                    'question'   => 'En quelle année a eu lieu la Révolution française ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'La Révolution française a commencé en 1789 avec la prise de la Bastille le 14 juillet.',
                    'answers'    => [
                        ['text' => '1789', 'correct' => true],
                        ['text' => '1776', 'correct' => false],
                        ['text' => '1804', 'correct' => false],
                        ['text' => '1815', 'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Qui a découvert l\'Amérique en 1492 ?',
                    'difficulty' => 'easy',
                    'explanation'=> 'Christophe Colomb, navigateur génois au service de l\'Espagne, a atteint les Amériques en 1492.',
                    'answers'    => [
                        ['text' => 'Christophe Colomb', 'correct' => true],
                        ['text' => 'Vasco de Gama',     'correct' => false],
                        ['text' => 'Magellan',           'correct' => false],
                        ['text' => 'Marco Polo',         'correct' => false],
                    ],
                ],
                [
                    'question'   => 'Pendant combien d\'années a duré la Première Guerre mondiale ?',
                    'difficulty' => 'medium',
                    'explanation'=> 'La Première Guerre mondiale a duré de 1914 à 1918, soit 4 ans.',
                    'answers'    => [
                        ['text' => '4 ans', 'correct' => true],
                        ['text' => '6 ans', 'correct' => false],
                        ['text' => '2 ans', 'correct' => false],
                        ['text' => '5 ans', 'correct' => false],
                    ],
                ],
            ],
        ];

        return $data[$category] ?? [];
    }
}